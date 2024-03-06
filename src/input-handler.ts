import { Display } from 'rot-js';
// import { renderFrameWithTitle } from './render-functions';
import { Action, BumpAction, DisconnectAction, DropItem, EquipAction, LogAction, PickupAction, WaitAction } from './actions';
import { Colors } from './colors';
import { renderFrameWithTitle } from './render-functions';
import { Engine } from './engine';
import { equipmentTypeToString } from './equipment-types';

interface LogMap {
    [key: string]: number;
}
const LOG_KEYS: LogMap = {
    ArrowUp: -1,
    ArrowDown: 1,
};

export enum InputState {
    Game,
    Dead,
    Log,
    UseInventory,
    DropInventory,
    Target,
}

export abstract class BaseInputHandler {
    nextHandler: BaseInputHandler;
    mousePosition: [number, number];
    logCursorPosition: number;

    protected constructor(public inputState: InputState = InputState.Game) {
        this.nextHandler = this;
        this.mousePosition = [0, 0];
        this.logCursorPosition = window.messageLog.messages.length - 1;
    }

    abstract handleKeyboardInput(event: KeyboardEvent): Action | null;

    handleMouseMovement(position: [number, number]) {
        this.mousePosition = position;
    }

    onRender(_display: Display) { }
}

interface DirectionMap {
    [key: string]: [number, number];
}

const MOVE_KEYS: DirectionMap = {
    // Arrow Keys
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    // Numpad Keys
    2: [0, 1],
    4: [-1, 0],
    6: [1, 0],
    8: [0, -1],
    // Vi keys
    h: [-1, 0],
    j: [0, 1],
    k: [0, -1],
    l: [1, 0],
    // WASD keys
    w: [0, -1],
    a: [-1, 0],
    s: [0, 1],
    d: [1, 0],
};

export class GameInputHandler extends BaseInputHandler {
    constructor() {
        super();
    }

    handleKeyboardInput(event: KeyboardEvent): Action | null {
        if (window.engine.player!.fighter.hp > 0 && !window.engine.player!.alarm!.isToggled()) {
            if (window.engine.player!.level.requiresLevelUp) {
                this.nextHandler = new LevelUpEventHandler();
                return null;
            }
            if (event.key in MOVE_KEYS) {
                const [dx, dy] = MOVE_KEYS[event.key];
                return new BumpAction(dx, dy);
            }
            if (event.key === 'v') {
                this.nextHandler = new LogInputHandler();
            }
            if (event.key === '5' || event.key === '.') {
                return new WaitAction();
            }
            if (event.key === 'g') {
                return new PickupAction();
            }
            if (event.key === 'i') {
                this.nextHandler = new InventoryInputHandler(InputState.UseInventory);
            }
            if (event.key === 'o') {
                this.nextHandler = new InventoryInputHandler(InputState.DropInventory);
            }
            if (event.key === 'c') {
                this.nextHandler = new CharacterScreenInputHandler();
            }
            if (event.key === '?') {
                this.nextHandler = new HelpScreenInputHandler();
            }
            if (event.key === 'q') {
                return new DisconnectAction();
            }
            if (event.key === '/') {
                //this.nextHandler = new LookHandler();
            }
        }

        return null;
    }
}

export class InventoryInputHandler extends BaseInputHandler {
    constructor(inputState: InputState) {
        super(inputState);
    }

    onRender(display: Display) {
        const title =
            this.inputState === InputState.UseInventory
                ? 'Select an item to use'
                : 'Select an item to drop';
        const itemCount = window.engine.player!.inventory.items.length;
        const height = itemCount + 2 <= 3 ? 3 : itemCount + 2;
        const width = title.length + 45;
        const x = window.engine.player!.x <= 30 ? 40 : 0;
        const y = 0;

        renderFrameWithTitle(x, y, width, height, title);

        if (itemCount > 0) {
            window.engine.player!.inventory.items.forEach((i, index) => {
                const key = String.fromCharCode('a'.charCodeAt(0) + index);
                const isEquipped = window.engine.player!.equipment.itemIsEquipped(i);
                const power = i.equippable ? ` Pow: ${i.equippable.powerBonus}` : ``
                const defense = i.equippable ? ` Def: ${i.equippable.defenseBonus}` : ``
                const programType = i.equippable ? ` (${equipmentTypeToString(i.equippable.equipmentType)})` : ``
                let itemString = `(${key}) ${i.name}${programType}${power}${defense}`;
                itemString = isEquipped ? `${itemString} (E)` : itemString;
                display.drawText(x + 1, y + index + 1, itemString);
            });
        } else {
            display.drawText(x + 1, y + 1, '(Empty)');
        }
    }

    handleKeyboardInput(event: KeyboardEvent): Action | null {
        if (event.key.length === 1) {
            const ordinal = event.key.charCodeAt(0);
            const index = ordinal - 'a'.charCodeAt(0);

            if (index >= 0 && index <= 26) {
                const item = window.engine.player!.inventory.items[index];
                if (item) {
                    this.nextHandler = new GameInputHandler();
                    if (this.inputState === InputState.UseInventory) {
                        if (item.consumable) {
                            return item.consumable.getAction();
                        } else if (item.equippable) {
                            return new EquipAction(item);
                        }
                        return null;
                    } else if (this.inputState === InputState.DropInventory) {
                        return new DropItem(item);
                    }
                } else {
                    window.messageLog.addMessage('Invalid entry.', Colors.InvalidItemText);
                    return null;
                }
            }
        }
        this.nextHandler = new GameInputHandler();
        return null;
    }
}

export class CharacterScreenInputHandler extends BaseInputHandler {
    constructor() {
        super();
    }

    onRender(display: Display) {
        const x = window.engine.player!.x <= 30 ? 40 : 0;
        const y = 0;
        const title = 'Character Information';
        const width = title.length + 4;

        renderFrameWithTitle(x, y, width, 7, title);

        display.drawText(
            x + 1,
            y + 1,
            `Level: ${window.engine.player!.level.currentLevel}`,
        );
        display.drawText(
            x + 1,
            y + 2,
            `XP: ${window.engine.player!.level.currentXp}`,
        );
        display.drawText(
            x + 1,
            y + 3,
            `XP for next Level: ${window.engine.player!.level.experienceToNextLevel}`,
        );
        display.drawText(
            x + 1,
            y + 4,
            `Power: ${window.engine.player!.fighter.power}`,
        );
        display.drawText(
            x + 1,
            y + 5,
            `Defense: ${window.engine.player!.fighter.defense}`,
        );
    }

    handleKeyboardInput(_event: KeyboardEvent): Action | null {
        this.nextHandler = new GameInputHandler();
        return null;
    }
}

export class LogInputHandler extends BaseInputHandler {
    constructor() {
        super(InputState.Log);
    }

    handleKeyboardInput(event: KeyboardEvent): Action | null {
        if (event.key === 'Home') {
            return new LogAction(() => (this.logCursorPosition = 0));
        }
        if (event.key === 'End') {
            return new LogAction(
                () => (this.logCursorPosition = window.messageLog.messages.length - 1),
            );
        }

        const scrollAmount = LOG_KEYS[event.key];

        if (!scrollAmount) {
            this.nextHandler = new GameInputHandler();
        }

        return new LogAction(() => {
            if (scrollAmount < 0 && this.logCursorPosition === 0) {
                this.logCursorPosition = window.messageLog.messages.length - 1;
            } else if (
                scrollAmount > 0 &&
                this.logCursorPosition === window.messageLog.messages.length - 1
            ) {
                this.logCursorPosition = 0;
            } else {
                this.logCursorPosition = Math.max(
                    0,
                    Math.min(
                        this.logCursorPosition + scrollAmount,
                        window.messageLog.messages.length - 1,
                    ),
                );
            }
        });
    }
}

export class LevelUpEventHandler extends BaseInputHandler {
    constructor() {
        super();
    }

    onRender(display: Display) {
        let x = 0;
        if (window.engine.player!.x <= 30) {
            x = 40;
        }

        renderFrameWithTitle(x, 0, 35, 8, 'Level Up');

        display.drawText(x + 1, 1, 'Congratulations! You level up!');
        display.drawText(x + 1, 2, 'Select an attribute to increase.');

        display.drawText(
            x + 1,
            4,
            `a) Constitution (+10 HP, from ${window.engine.player!.fighter.maxHp})`,
        );
        display.drawText(
            x + 1,
            5,
            `b) Intelligence (+1 power, from ${window.engine.player!.fighter.power})`,
        );
        display.drawText(
            x + 1,
            6,
            `c) Wit (+1 defense, from ${window.engine.player!.fighter.defense})`,
        );
    }

    handleKeyboardInput(event: KeyboardEvent): Action | null {
        if (event.key === 'a') {
            window.engine.player!.level.increaseMaxHp();
        } else if (event.key === 'b') {
            window.engine.player!.level.increasePower();
        } else if (event.key === 'c') {
            window.engine.player!.level.increaseDefense();
        } else {
            window.messageLog.addMessage('Invalid entry.', Colors.InvalidText);
            return null;
        }

        this.nextHandler = new GameInputHandler();
        return null;
    }
}

export abstract class SelectIndexHandler extends BaseInputHandler {
    protected constructor() {
        super(InputState.Target);
        const { x, y } = window.engine.player!;
        this.mousePosition = [x, y];
    }

    handleKeyboardInput(event: KeyboardEvent): Action | null {
        if (event.key in MOVE_KEYS) {
            const moveAmount = MOVE_KEYS[event.key];
            let modifier = 1;
            if (event.shiftKey) modifier = 5;
            if (event.ctrlKey) modifier = 10;
            if (event.altKey) modifier = 20;

            let [x, y] = this.mousePosition;
            const [dx, dy] = moveAmount;
            x += dx * modifier;
            y += dy * modifier;
            x = Math.max(0, Math.min(x, Engine.MAP_WIDTH - 1));
            y = Math.max(0, Math.min(y, Engine.MAP_HEIGHT - 1));
            this.mousePosition = [x, y];
            return null;
        } else if (event.key === 'Enter') {
            let [x, y] = this.mousePosition;
            return this.onIndexSelected(x, y);
        }

        this.nextHandler = new GameInputHandler();
        return null;
    }

    abstract onIndexSelected(x: number, y: number): Action | null;
}


export class HelpScreenInputHandler extends BaseInputHandler {
    constructor() {
        super();
    }

    onRender(display: Display) {
        const x = window.engine.player!.x <= 30 ? 40 : 0;
        let y = 0;
        const title = 'Help';
        const width = title.length + 40;

        renderFrameWithTitle(x, y, width, 8, title);

        y++
        display.drawText(
            x + 1,
            y,
            `Movement: wasd / hjkl / arrow keys`,
        );
        y++
        display.drawText(
            x + 1,
            y,
            `Inventory: i / o`,
        );
        y++
        display.drawText(
            x + 1,
            y,
            `Character: c`,
        );
        y++
        display.drawText(
            x + 1,
            y,
            `Log: v`,
        );
        y++
        display.drawText(
            x + 1,
            y,
            `Skip turn: .`,
        );
        y++
        display.drawText(
            x + 1,
            y,
            `Disconnect: q`,
        );
    }

    handleKeyboardInput(_event: KeyboardEvent): Action | null {
        this.nextHandler = new GameInputHandler();
        return null;
    }
}

type ActionCallback = (x: number, y: number) => Action | null;

export class SingleRangedAttackHandler extends SelectIndexHandler {
    constructor(public callback: ActionCallback) {
        super();
    }

    onIndexSelected(x: number, y: number): Action | null {
        this.nextHandler = new GameInputHandler();
        return this.callback(x, y);
    }
}
