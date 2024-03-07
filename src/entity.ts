import { BaseAI, HostileAI, TurretAI } from "./components/ai";
import { Alarm } from "./components/alarm";
import { BaseComponent } from "./components/base-component";
import { Consumable, EmpConsumable, ExplosiveConsumable, HealingConsumable } from "./components/consumable";
import { Equipment } from "./components/equipment";
import { AgentTesla, Clippy, Equippable, FormBook, ILoveYou, LokiBot, MyDoom, Notepad, Slammer } from "./components/equippable";
import { Fighter } from "./components/fighter";
import { Inventory } from "./components/inventory";
import { Level } from "./components/level";
import { Loot } from "./components/loot";
import { DamageType } from "./damage-types";
import { GameMap } from "./game-map";

type SPAWNMAP = {
    [key: string]: (gameMap: GameMap, x: number, y: number) => Entity;
};

export const spawnMap: SPAWNMAP = {
    // Enemies
    spawnSurveillanceTurret,
    spawnServer,
    spawnDrone,
    // Consumables
    spawnEmp,
    spawnHealthPotion,
    spawnGrenade,
    // Software
    spawnNotepad,
    spawnClippy,
    // Malware
    spawnAgentTesla,
    spawnFormBook,
    spawnLokiBot,
    // Virus
    spawnILoveYou,
    spawnMyDoom,
    spawnSlammer
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
    sightColor: string = '#e4c32e'

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
    loot: Loot | null

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
        loot: Loot | null = null,
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
        this.loot = loot
        if (this.loot != null) {
            this.loot.parent = this
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
        super(x, y, char, fg, bg, name, false, RenderOrder.Item, parent)
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
        new Level(5, 0, 1, 0, 15),
        new Alarm(3),
        null,
        gameMap,
    );
    return player;
}

export function spawnSurveillanceTurret(gameMap: GameMap, x: number, y: number): Actor {
    return new Actor(
        x,
        y,
        'T',
        '#687368',
        '#000',
        'Surveillance Turret',
        new TurretAI(3),
        new Equipment(),
        new Fighter(1, 0, 3),
        new Inventory(0),
        new Level(0, 1),
        null,
        null,
        gameMap,
    );
}

export function spawnDrone(gameMap: GameMap, x: number, y: number): Actor {
    return new Actor(
        x,
        y,
        'D',
        '#ecde1f',
        '#000',
        'Drone',
        new HostileAI(),
        new Equipment(),
        new Fighter(2, 5, 2),
        new Inventory(0),
        new Level(0, 2),
        null,
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
        new Fighter(3, 0, 0),
        new Inventory(0),
        new Level(0, 1),
        null,
        new Loot(),
        gameMap,
    );
}

export function spawnNAS(gameMap: GameMap, x: number, y: number): Actor {
    return new Actor(
        x,
        y,
        'N',
        '#c961e6',
        '#000',
        'NAS',
        null,
        new Equipment(),
        new Fighter(5, 10, 0),
        new Inventory(0),
        new Level(0, 5),
        null,
        new Loot(),
        gameMap,
    );
}

export function spawnMainframe(gameMap: GameMap, x: number, y: number): Actor {
    return new Actor(
        x,
        y,
        'M',
        '#c961e6',
        '#000',
        'Mainframe',
        null,
        new Equipment(),
        new Fighter(50, 15, 5),
        new Inventory(0),
        new Level(0, 15),
        null,
        new Loot(),
        gameMap,
    );
}

export function spawnEmp(
    gameMap: GameMap,
    x: number,
    y: number,
): Item {
    return new Item(
        x,
        y,
        'e',
        '#FFFF00',
        '#000',
        'Emp',
        new EmpConsumable({ damageType: DamageType.Electricity, amount: 3 }),
        null,
        gameMap,
    );
}

export function spawnHealthPotion(
    gameMap: GameMap,
    x: number,
    y: number,
): Item {
    return new Item(
        x,
        y,
        'h',
        '#89ff68',
        '#000',
        'Health USB Stick',
        new HealingConsumable(4),
        null,
        gameMap,
    );
}

export function spawnGrenade(
    gameMap: GameMap,
    x: number,
    y: number,
): Item {
    return new Item(
        x,
        y,
        'f',
        '#ff8000',
        '#000',
        'Grenade',
        new ExplosiveConsumable({ damageType: DamageType.Fire, amount: 3 }, 3),
        null,
        gameMap,
    );
}

export function spawnNotepad(gameMap: GameMap, x: number, y: number): Item {
    return new Item(
        x,
        y,
        's',
        '#00bfff',
        '#000',
        'Notepad',
        null,
        new Notepad(),
        gameMap,
    );
}

export function spawnClippy(gameMap: GameMap, x: number, y: number): Item {
    return new Item(
        x,
        y,
        's',
        '#00bfff',
        '#000',
        'Clippy',
        null,
        new Clippy(),
        gameMap,
    );
}

export function spawnAgentTesla(gameMap: GameMap, x: number, y: number): Item {
    return new Item(
        x,
        y,
        'm',
        '#33ff00',
        '#000',
        'Agent Tesla',
        null,
        new AgentTesla(),
        gameMap,
    );
}

export function spawnFormBook(gameMap: GameMap, x: number, y: number): Item {
    return new Item(
        x,
        y,
        'm',
        '#33ff00',
        '#000',
        'FormBook',
        null,
        new FormBook(),
        gameMap,
    );
}

export function spawnLokiBot(gameMap: GameMap, x: number, y: number): Item {
    return new Item(
        x,
        y,
        'm',
        '#33ff00',
        '#000',
        'Loki Bot',
        null,
        new LokiBot(),
        gameMap,
    );
}

export function spawnILoveYou(gameMap: GameMap, x: number, y: number): Item {
    return new Item(
        x,
        y,
        'v',
        '#00ffee',
        '#000',
        'ILoveYou',
        null,
        new ILoveYou(),
        gameMap,
    );
}

export function spawnMyDoom(gameMap: GameMap, x: number, y: number): Item {
    return new Item(
        x,
        y,
        'v',
        '#00ffee',
        '#000',
        'MyDoom',
        null,
        new MyDoom(),
        gameMap,
    );
}

export function spawnSlammer(gameMap: GameMap, x: number, y: number): Item {
    return new Item(
        x,
        y,
        'v',
        '#00ffee',
        '#000',
        'Slammer',
        null,
        new Slammer(),
        gameMap,
    );
}