import { Colors } from "../colors";
import { Actor, RenderOrder } from "../entity";
import { BaseComponent } from "./base-component";

export class Fighter extends BaseComponent {
    parent: Actor | null
    _hp: number

    constructor(
        public maxHp: number,
        public baseAttack: number,
        public baseDefense: number,
    ) {
        super()
        this._hp = maxHp
        this.parent = null
    }

    public get hp() : number {
        return this._hp
    }

    public set hp(value: number) {
        this._hp = Math.max(0, Math.min(value, this.maxHp))
        if (this._hp === 0 && this.parent?.isAlive) {
            this.die()
        }
    }

    die() {
        if (!this.parent) return

        let deathMessage = ''
        let fg = Colors.MobDeathText
        if (window.engine.player === this.parent) {
            deathMessage = "You died."
            fg = Colors.PlayerDeathText
        } else {
            deathMessage = `${this.parent.name} is dead.`
            fg = Colors.MobDeathText
        }

        this.parent.char = '%'
        this.parent.fg = Colors.Corpse
        this.parent.blocksMovement = false
        this.parent.ai = null
        this.parent.name = `Remains of ${this.parent.name}`
        this.parent.renderOrder = RenderOrder.Corpse

        window.messageLog.addMessage(deathMessage, fg)
        window.engine.player?.level.addXp(this.parent.level.xpGiven)
    }
}