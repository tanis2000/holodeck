import { BaseComponent } from "./base-component";

export class Level extends BaseComponent {
    constructor(
        public levelUpBase: number = 0,
        public xpGiven: number = 0,
        public currentLevel: number =0,
        public currentXp: number = 0,
        public levelUpFactor: number = 0,
    ) {
        super()
    }

    public get experienceToNextLevel() : number {
        return this.levelUpBase + this.currentLevel * this.levelUpFactor
    }

    public get requiresLevelUp() : boolean {
        return this.currentXp > this.experienceToNextLevel
    }

    addXp(xp: number) {
        if (xp === 0 || this.levelUpBase === 0) return;

        this.currentXp += xp
        window.messageLog.addMessage(`${xp} experience points gained.`)

        if (this.requiresLevelUp) {
            window.messageLog.addMessage(`You gained a new level. You are now level ${this.currentLevel + 1}`)
        }
    }

    increaseLevel() {
        this.currentXp -= this.experienceToNextLevel
        this.currentLevel++
    }
}