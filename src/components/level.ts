import { Actor } from "../entity";
import { BaseComponent } from "./base-component";

/*
type XpProgression = [number, number][]

const XP_PROGRESSION: XpProgression = [
    [1, 5],
    [20, 10],
    [40, 13],
    [999999, 16]
]
*/

export class Level extends BaseComponent {
    constructor(
        public levelUpBase: number = 0,
        public xpGiven: number = 0,
        public currentLevel: number = 0,
        public currentXp: number = 0,
        public levelUpFactor: number = 0,
    ) {
        super()
    }

    public get experienceToNextLevel(): number {
        return this.levelUpBase + (this.currentLevel - 1) * this.levelUpFactor
    }

    public get requiresLevelUp(): boolean {
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

    increaseMaxHp(amount: number = 10) {
        const actor = this.parent as Actor;
        if (!actor) return;
        actor.fighter.maxHp += amount;
        actor.fighter.hp += amount;

        window.messageLog.addMessage('Your health improves!');

        this.increaseLevel();
    }

    increasePower(amount: number = 1) {
        const actor = this.parent as Actor;
        if (!actor) return;
        actor.fighter.basePower += amount;

        window.messageLog.addMessage('You feel stronger!');

        this.increaseLevel();
    }

    increaseDefense(amount: number = 1) {
        const actor = this.parent as Actor;
        if (!actor) return;
        actor.fighter.baseDefense += amount;

        window.messageLog.addMessage('Your movements are getting swifter!');

        this.increaseLevel();
    }

}