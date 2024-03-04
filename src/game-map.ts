import * as ROT from "rot-js";
import { Engine } from "./engine";
import Digger from "rot-js/lib/map/digger";
import { Entity, spawnPlayer } from "./entity";
import { FLOOR_TILE, Tile, WALL_TILE } from "./tile-types";

type Door = {
    x: number
    y: number
    open: boolean
}

type Corridor = {
    x: number
    y: number
    value: number
}

export class GameMap {
    display: ROT.Display
    map: Digger
    public static doors: Door[]
    public static corridors: Corridor[]
    entities: Entity[]
    tiles: Tile[]

    constructor(display: ROT.Display) {
        this.display = display
        this.tiles = []
        this.entities = []
        this.map = new ROT.Map.Digger(Engine.MAP_WIDTH, Engine.MAP_HEIGHT)
        this.initMap()
        const startingRoom = this.map.getRooms()[0]
        window.engine.player = spawnPlayer(startingRoom.getCenter()[0], startingRoom.getCenter()[1], this)
    }

    public get gameMap(): GameMap {
        return this
    }

    drawDoor(x: number, y: number) {
        this.display.draw(x, y, '|', '#0070ff', '#000')
    }

    initDoor(x: number, y: number) {
        GameMap.doors.push({ x: x, y: y, open: false })
    }

    initDoors() {
        GameMap.doors = new Array()
        for (let room of this.map.getRooms()) {
            for (let y = room.getTop(); y < room.getBottom(); y++) {
                for (let x = room.getLeft(); x < room.getRight(); x++) {
                    this.display.draw(x, y, '', '#fff', '#000')
                    room.getDoors(this.initDoor)
                }
            }
        }
    }

    initCorridor(x: number, y: number, value: number) {
        GameMap.corridors.push({ x: x, y: y, value: value })
    }

    initCorridors() {
        GameMap.corridors = new Array()
        for (let corridor of this.map.getCorridors()) {
            corridor.create(this.initCorridor)
        }
    }

    initMap() {
        for (let i = 0; i < Engine.MAP_WIDTH * Engine.MAP_HEIGHT; i++) {
            this.tiles[i] = WALL_TILE
        }
        this.map.create()
        this.initDoors();
        this.initCorridors()

        for (let room of this.map.getRooms()) {
            for (let y = room.getTop(); y <= room.getBottom(); y++) {
                for (let x = room.getLeft(); x <= room.getRight(); x++) {
                    this.tiles[y * Engine.MAP_WIDTH + x] = FLOOR_TILE
                    //this.display.draw(x, y, '', '#fff', '#000')
                }
            }
        }

        for (let corridor of GameMap.corridors) {
            this.tiles[corridor.y * Engine.MAP_WIDTH + corridor.x] = FLOOR_TILE
            //this.display.draw(corridor.x, corridor.y, 'c', '#fff', '#000')
        }

        // for (let door of GameMap.doors) {
        //     if (!door.open) { this.drawDoor(door.x, door.y) }
        // }
    }

    render() {
        for (let y = 0; y < Engine.MAP_HEIGHT; y++) {
            for (let x = 0; x < Engine.MAP_WIDTH; x++) {
                let tile = this.tiles[y * Engine.MAP_WIDTH + x]
                if (tile.visible) {
                    this.display.draw(x, y, tile.light.char, tile.light.fg, tile.light.bg)
                } else if (tile.seen) {
                    this.display.draw(x, y, tile.dark.char, tile.dark.fg, tile.dark.bg)
                }
            }
        }

        const sortedEntities = this.entities
            .slice()
            .sort((a, b) => a.renderOrder - b.renderOrder)

        for (const en of sortedEntities) {
            if (this.tileIsVisible(en.x, en.y)) {
                this.display.draw(en.x, en.y, en.char, en.fg, en.bg)
            }
        }
    }

    public addEntity(en: Entity) {
        this.entities.push(en)
    }

    public removeEntity(en: Entity) {
        const idx = this.entities.indexOf(en)
        if (idx >= 0) {
            this.entities.splice(idx, 1)
        }
    }

    public tileIsWalkable(x: number, y: number) {
        return this.tiles[y * Engine.MAP_WIDTH + x].walkable
    }

    public tileIsVisible(x: number, y: number) {
        return this.tiles[y * Engine.MAP_WIDTH + x].visible
    }

    isInBounds(x: number, y: number) {
        return 0 <= x && x < Engine.MAP_WIDTH && 0 <= y && y < Engine.MAP_HEIGHT;
    }

    lightPasses(x: number, y: number): boolean {
        if (this.isInBounds(x, y)) {
            return this.tiles[y * Engine.MAP_WIDTH + x].transparent;
        }
        return false;
    }

    updateFov(player: Entity) {
        for (let y = 0; y < Engine.MAP_HEIGHT; y++) {
            for (let x = 0; x < Engine.MAP_WIDTH; x++) {
                this.tiles[y * Engine.MAP_WIDTH + x].visible = false;
            }
        }

        const fov = new ROT.FOV.PreciseShadowcasting(this.lightPasses.bind(this));
        fov.compute(player.x, player.y, 8, (x, y, _r, visibility) => {
            console.log(visibility)
            if (visibility === 1) {
                this.tiles[y * Engine.MAP_WIDTH + x].visible = true;
                this.tiles[y * Engine.MAP_WIDTH + x].seen = true;
            }
        });
    }
}