import * as ROT from "rot-js";
import { Engine } from "./engine";
import Digger from "rot-js/lib/map/digger";
import { Actor, Entity, Item, RenderOrder, spawnMap } from "./entity";
import { FLOOR_TILE, Tile, WALL_TILE } from "./tile-types";
import { ENEMIES_CHANCES, ITEMS_CHANCES, MAX_ENEMIES_BY_LEVEL, MAX_ITEMS_BY_LEVEL, generateRandomNumber, getMaxValueForLevel, getWeights } from "./rng";
import { Room } from "rot-js/lib/map/features";

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
    startingRoom: Room | null = null

    constructor(display: ROT.Display) {
        this.display = display
        this.tiles = []
        this.entities = []
        this.map = new ROT.Map.Digger(Engine.MAP_WIDTH, Engine.MAP_HEIGHT, {dugPercentage: 30})
        this.initMap()
        this.startingRoom = this.map.getRooms()[0]
        //window.engine.player = spawnPlayer(startingRoom.getCenter()[0], startingRoom.getCenter()[1], this)
    }

    public get gameMap(): GameMap {
        return this
    }

    public get actors(): Actor[] {
        return this.entities.filter((en) => en instanceof Actor)
            .map((en) => en as Actor)
    }

    public get items(): Item[] {
        return this.entities.filter((e) => e instanceof Item).map((e) => e as Item);
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

    placeEntities(room: Room, level: number) {
        const numberOfEnemiesToAdd = generateRandomNumber(0, getMaxValueForLevel(MAX_ENEMIES_BY_LEVEL, level))
        for (let i = 0; i < numberOfEnemiesToAdd; i++) {
            const x = generateRandomNumber(room.getLeft() + 1, room.getRight() - 1);
            const y = generateRandomNumber(room.getTop(), room.getBottom() - 1);

            if (!this.entities.some((e) => e.x == x && e.y == y)) {
                const weights = getWeights(ENEMIES_CHANCES, level);
                const spawnType = ROT.RNG.getWeightedValue(weights);
                if (spawnType) {
                    spawnMap[spawnType](this, x, y);
                }
            }
        }

        const numberOfItemsToAdd = generateRandomNumber(0, getMaxValueForLevel(MAX_ITEMS_BY_LEVEL, level))
        for (let i = 0; i < numberOfItemsToAdd; i++) {
            const x = generateRandomNumber(room.getLeft() + 1, room.getRight() - 1);
            const y = generateRandomNumber(room.getTop(), room.getBottom() - 1);

            if (!this.entities.some((e) => e.x == x && e.y == y)) {
                const weights = getWeights(ITEMS_CHANCES, level);
                const spawnType = ROT.RNG.getWeightedValue(weights);
                if (spawnType) {
                    spawnMap[spawnType](this, x, y);
                }
            }
        }
    }

    initMap() {
        for (let i = 0; i < Engine.MAP_WIDTH * Engine.MAP_HEIGHT; i++) {
            this.tiles[i] = { ...WALL_TILE }
        }
        this.map.create()
        this.initDoors();
        this.initCorridors()

        let roomNumber = 0
        for (let room of this.map.getRooms()) {
            for (let y = room.getTop(); y <= room.getBottom(); y++) {
                for (let x = room.getLeft(); x <= room.getRight(); x++) {
                    this.tiles[y * Engine.MAP_WIDTH + x] = { ...FLOOR_TILE }
                    //this.display.draw(x, y, '', '#fff', '#000')
                }
            }
            if (roomNumber > 0) {
                this.placeEntities(room, 1)
            }
            roomNumber++
        }

        for (let corridor of GameMap.corridors) {
            this.tiles[corridor.y * Engine.MAP_WIDTH + corridor.x] = { ...FLOOR_TILE }
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
                this.drawEntity(en)
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

    public getBlockingEntityAtLocation(x: number, y: number): Entity | undefined {
        return this.entities.find((en) => en.blocksMovement && en.x == x && en.y == y)
    }

    public getActorAtLocation(x: number, y: number): Actor | undefined {
        return this.actors.find((en) => en.x == x && en.y == y)
    }

    drawEntity(en: Entity) {
        this.display.draw(en.x, en.y, en.char, en.fg, en.bg)
        if (en.sightRange > 0 && en.renderOrder != RenderOrder.Corpse) {
            this.drawCircle(en.x, en.y, en.sightRange, en.sightColor)
        }
    }

    drawCircle(cx: number, cy: number, r: number, bg: string) {
        for (let y = cy - r; y < cy + r; y++) {
            for (let x = cx - r; x < cx + r; x++) {
                if (this.tileIsWalkable(x, y)) {
                    this.display.drawOver(x, y, '', '#000', bg)
                }
            }
        }
    }

    getTile(x: number, y: number): Tile | null {
        if (!this.isInBounds(x, y)) {
            return null
        }
        return this.tiles[y * Engine.MAP_WIDTH + x]
    }

    public tileIsWalkable(x: number, y: number) {
        const tile = this.getTile(x, y)
        return tile != null && tile.walkable
        //return this.tiles[y * Engine.MAP_WIDTH + x].walkable
    }

    public tileIsVisible(x: number, y: number) {
        const tile = this.getTile(x, y)
        return tile != null && tile.visible
        //return this.tiles[y * Engine.MAP_WIDTH + x].visible
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
            if (visibility === 1) {
                this.tiles[y * Engine.MAP_WIDTH + x].visible = true;
                this.tiles[y * Engine.MAP_WIDTH + x].seen = true;
            }
        });
    }
}