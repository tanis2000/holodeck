import { Display } from "rot-js";
import { BaseScreen } from "./base-screen";
import { Engine } from "../engine";
import { BaseInputHandler, MainMenuInputHandler } from "../input-handler";

type Member = {
    publicID: String,
    score: number,
    rank: number,
}

type Leaderboard = {
    success: boolean,
    members: Member[],
}

const OPTIONS = ['[N] Play a new game']

// if (localStorage.getItem('holodeck-save')) {
//   OPTIONS.push('[C] Continue last game')
// }

const MENU_WIDTH = 24

export class MainMenu extends BaseScreen {
    inputHandler: BaseInputHandler;
    leaderBoard: Leaderboard | null = null

    constructor(display: Display) {
        super(display)
        this.inputHandler = new MainMenuInputHandler(this.display)
        this.loadScore()
    }

    update(event: KeyboardEvent): void {
        this.inputHandler.handleKeyboardInput(event)
        this.inputHandler = this.inputHandler.nextHandler
    }

    render(): void {
        this.display.clear()

        let x = 20
        let y = 10
        this.display.draw(x, y+0, ` _   _       _       ____            _    `, '#5be033', '#000')
        this.display.draw(x, y+1, `| | | | ___ | | ___ |  _ \\  ___  ___| | __`, '#5be033', '#000')
        this.display.draw(x, y+2, `| |_| |/ _ \\| |/ _ \\| | | |/ _ \\/ __| |/ /`, '#5be033', '#000')
        this.display.draw(x, y+3, `|  _  | (_) | | (_) | |_| |  __/ (__|   < `, '#5be033', '#000')
        this.display.draw(x, y+4, `|_| |_|\\___/|_|\\___/|____/ \\___|\\___|_|\\_\\`, '#5be033', '#000')

        this.display.draw(Math.floor(Engine.WIDTH / 2)-4, y+6, `v0.1.2`.padEnd(MENU_WIDTH, ' '), '#3f9a23', '#000')

        let i = 0
        for (const option of OPTIONS) {
            const x = Math.floor(Engine.WIDTH / 2) - 20
            const y = Math.floor(Engine.HEIGHT / 2 - 1 + i)

            this.display.draw(x, y, option.padEnd(MENU_WIDTH, ' '), '#fff', '#000')
            i++
        }

        if (this.leaderBoard != null) {
            this.display.draw(60, 2, `Leaderboard`, '#3f9a23', '#000')
            let i = 0
            for (const member of this.leaderBoard.members) {
                const x = 44
                const y = 4 + i
                const value = `${member.rank.toString().padStart(2, '0')}. ${member.publicID.padEnd(MENU_WIDTH, '.')} ${member.score}`
                this.display.drawText(x, y, value)
                i++
            }
        }

        this.inputHandler.onRender(this.display)
    }

    async loadScore() {
        const res = await fetch(`https://podium.altralogica.it/l/holodeck/top/0?pageSize=20`)
        const scores = await res.json()
        console.log(scores)
        this.leaderBoard = scores;
    }

}