import { BaseAI, TurretAI } from "./components/ai";
import { Alarm } from "./components/alarm";
import { BaseComponent } from "./components/base-component";
import { Consumable } from "./components/consumable";
import { Equipment } from "./components/equipment";
import { Equippable } from "./components/equippable";
import { Fighter } from "./components/fighter";
import { Inventory } from "./components/inventory";
import { Level } from "./components/level";
import { GameMap } from "./game-map";

type SPAWNMAP = {
    [key: string]: (gameMap: GameMap, x: number, y: number) => Entity;
};

export const spawnMap: SPAWNMAP = {
    spawnSurveillanceTurret,
    spawnServer,
};

export enum RenderOrder {
    Corpse,
    Item,
    Actor,
}

export class Entity {
    x: number
    y: number
    char: string
    fg: string = '#fff'
    bg: string = '#000'
    name: string = "Unknown"
    blocksMovement: boolean = false
    renderOrder: RenderOrder = RenderOrder.Corpse
    parent: GameMap | BaseComponent | null
    sightRange: number = 0
    sightColor: string = '#e8431a95'

    constructor(
        x: number,
        y: number,
        char: string,
        fg: string = '#fff',
        bg: string = '#000',
        name: string = "Unknown",
        blocksMovement: boolean = false,
        renderOrder: RenderOrder = RenderOrder.Corpse,
        parent: GameMap | BaseComponent | null = null,
    ) {
        this.x = x
        this.y = y
        this.char = char
        this.fg = fg
        this.bg = bg
        this.name = name
        this.parent = parent
        this.blocksMovement = blocksMovement
        this.renderOrder = renderOrder
        if (this.parent != null && this.parent instanceof GameMap) {
            this.parent.addEntity(this)
        }
    }

    public get gameMap(): GameMap | undefined {
        return this.parent?.gameMap
    }

    move(dx: number, dy: number) {
        this.x += dx
        this.y += dy
    }

    place(x: number, y: number, gameMap: GameMap | undefined) {
        this.x = x
        this.y = y
        if (gameMap) {
            if (this.parent) {
                if (this.parent === gameMap) {
                    gameMap.removeEntity(this)
                }
            }
            this.parent = gameMap;
            gameMap.addEntity(this)
        }
    }

    distance(x: number, y: number) {
        return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2)
    }
}

export class Actor extends Entity {
    ai: BaseAI | null
    equipment: Equipment
    fighter: Fighter
    inventory: Inventory
    level: Level
    alarm: Alarm | null

    constructor(
        x: number,
        y: number,
        char: string,
        fg: string = '#fff',
        bg: string = '#000',
        name: string = "Unknown",
        ai: BaseAI | null,
        equipment: Equipment,
        fighter: Fighter,
        inventory: Inventory,
        level: Level,
        alarm: Alarm | null = null,
        parent: GameMap | BaseComponent | null = null,
    ) {
        super(x, y, char, fg, bg, name, true, RenderOrder.Actor, parent)
        this.ai = ai
        this.equipment = equipment
        this.equipment.parent = this
        this.fighter = fighter
        this.fighter.parent = this
        this.inventory = inventory
        this.inventory.parent = this
        this.level = level
        this.level.parent = this
        this.alarm = alarm
        if (this.alarm != null) {
            this.alarm.parent = this
        }
    }

    public get isAlive(): boolean {
        return this.fighter.hp > 0
    }
}

export class Item extends Entity {
    consumable: Consumable | null
    equippable: Equippable | null

    constructor(
        x: number,
        y: number,
        char: string = '?',
        fg: string = '#fff',
        bg: string = '#000',
        name: string = "Unknown",
        consumable: Consumable | null = null,
        equippable: Equippable | null = null,
        parent: GameMap | BaseComponent | null = null,
    ) {
        super(x, y, char, fg, bg, name, true, RenderOrder.Item, parent)
        this.consumable = consumable
        if (this.consumable != null) {
            this.consumable.parent = this
        }
        this.equippable = equippable
        if (this.equippable != null) {
            this.equippable.parent = this
        }
    }
}

export function spawnPlayer(
    x: number,
    y: number,
    gameMap: GameMap | null = null,
): Actor {
    const player = new Actor(
        x,
        y,
        '@',
        '#6dbaf9',
        '#000000',
        'Player',
        null,
        new Equipment(),
        new Fighter(10, 1, 1),
        new Inventory(26),
        new Level(200),
        new Alarm(3),
        gameMap,
    );
    return player;
}

export function spawnSurveillanceTurret(gameMap: GameMap, x: number, y: number): Actor {
    return new Actor(
        x,
        y,
        't',
        '#687368',
        '#000',
        'Surveillance Turret',
        new TurretAI(3),
        new Equipment(),
        new Fighter(1, 0, 3),
        new Inventory(0),
        new Level(0, 1),
        null,
        gameMap,
    );
}

export function spawnServer(gameMap: GameMap, x: number, y: number): Actor {
    return new Actor(
        x,
        y,
        'S',
        '#c961e6',
        '#000',
        'Server',
        null,
        new Equipment(),
        new Fighter(1, 0, 3),
        new Inventory(0),
        new Level(0, 1),
        null,
        gameMap,
    );
}