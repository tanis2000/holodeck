import { Display } from "rot-js";
import { BaseScreen } from "./base-screen";
import { GameMap } from "../game-map";
import { BaseInputHandler, GameInputHandler, InputState } from "../input-handler";
import { Action } from "../actions";
import { ImpossibleException } from "../exceptions";
import { Colors } from "../colors";
import { renderAlarmBar, renderDefenseBar, renderFrameWithTitle, renderHealthBar, renderNamesAtLocation, renderPlayerLevelBar, renderPowerBar, renderXpBar } from "../render-functions";
import { spawnPlayer } from "../entity";

export class GameScreen extends BaseScreen {
    gameMap: GameMap | null = null
    inputHandler: BaseInputHandler

    constructor(display: Display) {
        super(display)
        this.inputHandler = new GameInputHandler()
        this.reset()
    }

    update(event: KeyboardEvent): void {
        const action = this.inputHandler.handleKeyboardInput(event);
        if (action instanceof Action) {
            try {
                action.perform(window.engine.player!, this.gameMap!);
                this.handleEnemyTurns();
            } catch (error) {
                if (error instanceof ImpossibleException) {
                    window.messageLog.addMessage(error.message, Colors.ImpossibleText);
                }
            }
        }
        this.gameMap!.updateFov(window.engine.player!)
        this.inputHandler = this.inputHandler.nextHandler;
    }

    render(): void {
        this.display.clear()
        window.messageLog.render(this.display, 21, 45, 40, 5)
        renderHealthBar(
            this.display,
            window.engine.player!.fighter.hp,
            window.engine.player!.fighter.maxHp,
            20,
        );
        renderAlarmBar(
            this.display,
            window.engine.player!.alarm!.currentLevel,
            window.engine.player!.alarm!.maxLevel,
            20,
        );
        renderPowerBar(
            this.display,
            window.engine.player!.fighter.power,
            20,
        )
        renderDefenseBar(
            this.display,
            window.engine.player!.fighter.defense,
            20,
        )
        renderPlayerLevelBar(
            this.display,
            window.engine.player!.level.currentLevel,
            20,
        )
        renderNamesAtLocation(
            21,
            44,
            this.inputHandler.mousePosition,
            this.gameMap!,
        )
        renderXpBar(
            this.display,
            window.engine.player!.level.currentXp,
            window.engine.player!.level.experienceToNextLevel,
            20,
        )

        this.gameMap!.render()

        if (this.inputHandler.inputState === InputState.Log) {
            renderFrameWithTitle(3, 3, 74, 38, 'Message History');
            window.messageLog.renderMessages(
                this.display,
                4,
                4,
                72,
                36,
                window.messageLog.messages.slice(
                    0,
                    this.inputHandler.logCursorPosition + 1,
                ),
            );
        }
        if (this.inputHandler.inputState === InputState.Target) {
            const [x, y] = this.inputHandler.mousePosition;
            this.display.drawOver(x, y, null, '#000', '#fff');
        }

        this.inputHandler.onRender(this.display);
    }

    handleEnemyTurns() {
        this.gameMap!.actors.forEach((e) => {
            if (e.isAlive) {
                try {
                    e.ai?.perform(e, this.gameMap!);
                } catch { }
            }
        });
    }

    reset() {
        this.gameMap = new GameMap(this.display)
        if (window.engine.player == null) {
            window.engine.player = spawnPlayer(this.gameMap!.startingRoom!.getCenter()[0], this.gameMap!.startingRoom!.getCenter()[1], this.gameMap)
        } else {
            window.engine.player.alarm!.resetLevel()
            window.engine.player.place(this.gameMap!.startingRoom!.getCenter()[0], this.gameMap!.startingRoom!.getCenter()[1], this.gameMap)
        }
        this.gameMap.updateFov(window.engine.player!)
    }
}