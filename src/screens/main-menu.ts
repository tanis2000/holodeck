import { Display } from "rot-js";
import { BaseScreen } from "./base-screen";
import { Engine } from "../engine";
import { GameScreen } from "./game-screen";

const OPTIONS = ['[N] Play a new game']

if (localStorage.getItem('7drl-2024-save')) {
  OPTIONS.push('[C] Continue last game')
}

const MENU_WIDTH = 24

export class MainMenu extends BaseScreen {
    constructor(display: Display) {
        super(display)
    }

    update(event: KeyboardEvent): void {
        if (event.key == 'n') {
            window.engine.nextScreen(new GameScreen(this.display))
        }
    }

    render(): void {
        this.display.clear()
        let i = 0
        for (const option of OPTIONS) {
            const x = Math.floor(Engine.WIDTH / 2)
            const y = Math.floor(Engine.HEIGHT / 2 - 1 + i)

            this.display.draw(x, y, option.padEnd(MENU_WIDTH, ' '), '#fff', '#000')
            i++
        }
    }

}