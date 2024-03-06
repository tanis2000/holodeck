import { Colors } from "../colors";
import { Actor } from "../entity";
import { GameScreen } from "../screens/game-screen";
import { BaseComponent } from "./base-component";

export class Alarm extends BaseComponent {
    _currentLevel = 0
    constructor(
        public maxLevel: number,
    ) {
        super()
    }

    public get currentLevel():number {
        return this._currentLevel
    }
    public increaseLevel() {
        this._currentLevel++;
        window.messageLog.addMessage(`Alarm level raised by 1`)
        this._currentLevel = Math.max(0, Math.min(this._currentLevel, this.maxLevel))
        if (this.currentLevel >= this.maxLevel) {
            this.disconnect()
        }
    }

    public resetLevel() {
        this._currentLevel = 0
    }

    public isToggled() {
        return this.currentLevel >= this.maxLevel
    }

    disconnect() {
        if (!this.parent) return

        let deathMessage = ''
        let fg = Colors.MobDeathText
        if (window.engine.player === this.parent) {
            deathMessage = "You have been disconnected."
            fg = Colors.PlayerDeathText
        } else {
            deathMessage = `${this.parent.name} has been disconnected.`
            fg = Colors.MobDeathText
        }

        let actor = this.parent as Actor
        window.messageLog.addMessage(deathMessage, fg)
        if (window.engine.player === this.parent) {
            (window.engine.screen as GameScreen).reset()
        } else {
            window.engine.player?.level.addXp(actor.level.xpGiven)
        }
    }
}