import { Colors } from "../colors";
import { DamageInfo, DamageType } from "../damage-types";
import { Actor, RenderOrder } from "../entity";
import { MainMenu } from "../screens/main-menu";
import { BaseComponent } from "./base-component";

export class Fighter extends BaseComponent {
    parent: Actor | null
    _hp: number

    constructor(
        public maxHp: number,
        public basePower: number,
        public baseDefense: number,
    ) {
        super()
        this._hp = maxHp
        this.parent = null
    }

    public get hp(): number {
        return this._hp
    }

    public set hp(value: number) {
        if (this._hp === 0) return

        this._hp = Math.max(0, Math.min(value, this.maxHp))
    }

    public get defenseBonus(): number {
        if (this.parent?.equipment) {
            return this.parent.equipment.defenseBonus;
        }
        return 0;
    }

    public get powerBonus(): number {
        if (this.parent?.equipment) {
            return this.parent.equipment.powerBonus;
        }
        return 0;
    }

    public get defense(): number {
        return this.baseDefense + this.defenseBonus;
    }

    public get power(): number {
        return this.basePower + this.powerBonus;
    }

    heal(amount: number): number {
        if (this.hp === this.maxHp) return 0;

        const newHp = Math.min(this.maxHp, this.hp + amount);
        const amountRecovered = newHp - this.hp;
        this.hp = newHp;

        return amountRecovered;
    }

    takeDamage(damage: DamageInfo) {
        this.hp -= damage.amount;

        if (this._hp === 0) {
            this.die(damage)
        }
    }

    die(damage: DamageInfo) {
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

        if (damage.damageType == DamageType.Software) {
            if (this.parent.loot != null) {
                this.parent.loot.drop()
            }
        }

        if (window.engine.player === this.parent) {
            // This is the player that died
            this.postScore()
            window.engine.nextScreen(new MainMenu(window.engine.display))
        } else {
            window.engine.player?.level.addXp(this.parent.level.xpGiven)
        }
    }

    async postScore() {
        await fetch(`https://podium.altralogica.it/l/holodeck/members/${window.engine.playerInfo.name}/score`, {
            method: 'PUT',
            body: `{"score":${this.parent!.level.currentLevel}}`
        })
    }
}