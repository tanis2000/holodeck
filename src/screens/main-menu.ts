import { Display } from "rot-js";
import { BaseScreen } from "./base-screen";
import { Engine } from "../engine";
import { GameScreen } from "./game-screen";
import { BaseInputHandler } from "../input-handler";

const OPTIONS = ['[N] Play a new game']

if (localStorage.getItem('7drl-2024-save')) {
  OPTIONS.push('[C] Continue last game')
}

const MENU_WIDTH = 24

export class MainMenu extends BaseScreen {
    inputHandler: BaseInputHandler | null;

    constructor(display: Display) {
        super(display)
        this.inputHandler = null
    }

    update(event: KeyboardEvent): void {
        if (event.key == 'n') {
            window.engine.nextScreen(new GameScreen(this.display))
        }
    }

    render(): void {
        this.display.clear()

        let x = 40
        let y = 10
        this.display.draw(x, y+0, ` _   _       _       ____            _    `, '#5be033', '#000')
        this.display.draw(x, y+1, `| | | | ___ | | ___ |  _ \\  ___  ___| | __`, '#5be033', '#000')
        this.display.draw(x, y+2, `| |_| |/ _ \\| |/ _ \\| | | |/ _ \\/ __| |/ /`, '#5be033', '#000')
        this.display.draw(x, y+3, `|  _  | (_) | | (_) | |_| |  __/ (__|   < `, '#5be033', '#000')
        this.display.draw(x, y+4, `|_| |_|\\___/|_|\\___/|____/ \\___|\\___|_|\\_\\`, '#5be033', '#000')

        this.display.draw(Math.floor(Engine.WIDTH / 2), y+6, `v0.1.0`.padEnd(MENU_WIDTH, ' '), '#3f9a23', '#000')

        let i = 0
        for (const option of OPTIONS) {
            const x = Math.floor(Engine.WIDTH / 2)
            const y = Math.floor(Engine.HEIGHT / 2 - 1 + i)

            this.display.draw(x, y, option.padEnd(MENU_WIDTH, ' '), '#fff', '#000')
            i++
        }
    }

}