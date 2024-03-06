import { Action, ItemAction } from "../actions";
import { Colors } from "../colors";
import { DamageInfo } from "../damage-types";
import { Entity, Item } from "../entity";
import { ImpossibleException } from "../exceptions";
import { GameMap } from "../game-map";
import { SingleRangedAttackHandler } from "../input-handler";
import { Inventory } from "./inventory";

export abstract class Consumable {
    constructor(public parent: Item | null) {
    }

    getAction(): Action | null {
        if (this.parent) {
            return new ItemAction(this.parent);
        }
        return null;
    }

    abstract activate(action: ItemAction, entity: Entity, gameMap: GameMap): void;

    consume() {
        const item = this.parent;
        if (item) {
            const inventory = item.parent;
            if (inventory instanceof Inventory) {
                const index = inventory.items.indexOf(item);
                if (index >= 0) {
                    inventory.items.splice(index, 1);
                }
            }
        }
    }
}

export class EmpConsumable extends Consumable {
    constructor(
        public damage: DamageInfo,
        parent: Item | null = null) {
        super(parent)
    }

    getAction(): Action | null {
        window.messageLog.addMessage(
            'Select a target location.',
            Colors.NeedTargetText,
        )
        window.engine.screen.inputHandler = new SingleRangedAttackHandler(
            (x, y) => {
                return new ItemAction(this.parent, [x, y]);
            },
        )
        return null;
    }

    activate(action: ItemAction, entity: Entity, gameMap: GameMap) {
        const target = action.targetActor(gameMap)

        if (!target) {
            throw new ImpossibleException('You must select an enemy to target.')
        }
        if (!gameMap.tileIsVisible(target.x, target.y)) {
            throw new ImpossibleException(
                'You cannot target an area you cannot see.',
            );
        }
        if (Object.is(target, entity)) {
            throw new ImpossibleException('You cannot confuse yourself!')
        }

        window.messageLog.addMessage(
            `The eyes of the ${target.name} look vacant, as it starts to stumble around!`,
            Colors.StatusEffectAppliedText,
        );
        target.fighter.takeDamage(this.damage)
        this.consume()
    }
}
