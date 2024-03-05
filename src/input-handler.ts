import { Display } from 'rot-js';
// import { renderFrameWithTitle } from './render-functions';
import { Action, BumpAction, WaitAction } from './actions';
import { Colors } from './colors';
import { renderFrameWithTitle } from './render-functions';

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
        if (true == true /*window.engine.player.fighter.hp > 0*/) {
            // if (window.engine.player.level.requiresLevelUp) {
            //   this.nextHandler = new LevelUpEventHandler();
            //   return null;
            // }
            if (event.key in MOVE_KEYS) {
                const [dx, dy] = MOVE_KEYS[event.key];
                return new BumpAction(dx, dy);
            }
            if (event.key === 'v') {
                //   this.nextHandler = new LogInputHandler();
            }
            if (event.key === '5' || event.key === '.') {
                return new WaitAction();
            }
            if (event.key === 'g') {
                // return new PickupAction();
            }
            if (event.key === 'i') {
                this.nextHandler = new InventoryInputHandler(InputState.UseInventory);
            }
            if (event.key === 'd') {
                //this.nextHandler = new InventoryInputHandler(InputState.DropInventory);
            }
            if (event.key === 'c') {
                //this.nextHandler = new CharacterScreenInputHandler();
            }
            if (event.key === '/') {
                //this.nextHandler = new LookHandler();
            }
            if (event.key === '>') {
                // return new TakeStairsAction();
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
        const width = title.length + 4;
        const x = window.engine.player!.x <= 30 ? 40 : 0;
        const y = 0;

        renderFrameWithTitle(x, y, width, height, title);

        if (itemCount > 0) {
            window.engine.player!.inventory.items.forEach((i, index) => {
                const key = String.fromCharCode('a'.charCodeAt(0) + index);
                const isEquipped = false;//window.engine.player!.equipment.itemIsEquipped(i);
                let itemString = `(${key}) ${i.name}`;
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
                            //return item.consumable.getAction();
                        } else if (item.equippable) {
                            //return new EquipAction(item);
                        }
                        return null;
                    } else if (this.inputState === InputState.DropInventory) {
                        //return new DropItem(item);
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
