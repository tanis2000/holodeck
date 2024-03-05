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
    }
}