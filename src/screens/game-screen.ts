import { Display } from "rot-js";
import { BaseScreen } from "./base-screen";
import { GameMap } from "../game-map";

export class GameScreen extends BaseScreen {
    gameMap: GameMap

    constructor(display: Display) {
        super(display)
        this.gameMap = new GameMap(display)
        this.gameMap.updateFov(window.engine.player!)
    }

    update(event: KeyboardEvent): void {
        // if (event.key == 'n') {
        //     window.engine.nextScreen(new GameScreen(this.display))
        // }
        this.gameMap.updateFov(window.engine.player!)
    }

    render(): void {
        this.display.clear()
        window.messageLog.render(this.display, 21, 45, 40, 5)
        this.gameMap.render()
    }

}