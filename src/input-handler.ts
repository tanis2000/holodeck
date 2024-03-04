import { Display } from 'rot-js';
// import { renderFrameWithTitle } from './render-functions';
import { Action } from './actions';

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
    Home: [-1, -1],
    End: [-1, 1],
    PageUp: [1, -1],
    PageDown: [1, 1],
    // Numpad Keys
    1: [-1, 1],
    2: [0, 1],
    3: [1, 1],
    4: [-1, 0],
    6: [1, 0],
    7: [-1, -1],
    8: [0, -1],
    9: [1, -1],
    // Vi keys
    h: [-1, 0],
    j: [0, 1],
    k: [0, -1],
    l: [1, 0],
    y: [-1, -1],
    u: [1, -1],
    b: [-1, 1],
    n: [1, 1],
    // UI keys
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
                // return new BumpAction(dx, dy);
            }
            if (event.key === 'v') {
                //   this.nextHandler = new LogInputHandler();
            }
            if (event.key === '5' || event.key === '.') {
                // return new WaitAction();
            }
            if (event.key === 'g') {
                // return new PickupAction();
            }
            if (event.key === 'i') {
                //this.nextHandler = new InventoryInputHandler(InputState.UseInventory);
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