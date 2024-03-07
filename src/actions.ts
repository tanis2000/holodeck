import { Colors } from "./colors";
import { DamageType } from "./damage-types";
import { Entity, Actor, Item } from "./entity";
import { ImpossibleException } from "./exceptions";
import { GameMap } from "./game-map";
import { generateRandomNumber } from "./rng";
import { GameScreen } from "./screens/game-screen";

export abstract class Action {
    abstract perform(entity: Entity, gameMap: GameMap): void
};

export abstract class ActionWithDirection extends Action {
    constructor(public dx: number, public dy: number) {
        super();
    }

    abstract perform(entity: Entity, gameMap: GameMap): void;
}

export class MovementAction extends ActionWithDirection {
    perform(entity: Entity, gameMap: GameMap) {
        const destX = entity.x + this.dx;
        const destY = entity.y + this.dy;

        if (!gameMap.isInBounds(destX, destY)) {
            throw new ImpossibleException('That way is blocked.');
        }
        if (!gameMap.tileIsWalkable(destX, destY)) {
            throw new ImpossibleException('That way is blocked.');
        }
        if (gameMap.getBlockingEntityAtLocation(destX, destY)) {
            throw new ImpossibleException('That way is blocked.');
        }
        entity.move(this.dx, this.dy);
    }
}

export class MeleeAction extends ActionWithDirection {
    perform(actor: Actor, gameMap: GameMap) {
        const destX = actor.x + this.dx
        const destY = actor.y + this.dy

        const target = gameMap.getActorAtLocation(destX, destY)
        if (!target) {
            throw new ImpossibleException('Nothing to hack.')
        }

        let roll = generateRandomNumber(0, actor.fighter.power)
        let damage = Math.max(0, roll - target.fighter.defense)
        if (roll == actor.fighter.power) {
            // critical hits always hit
            damage = Math.max(1, roll - target.fighter.defense)
        }
        let attackDescription = ``
        let damageType = DamageType.Software
        if (actor.equipment.powerBonus == 0) {
            // Nothing equipped, using bare hands
            damageType = DamageType.BareHands
            attackDescription = `${actor.name.toUpperCase()} hits ${target.name} with bare hands`
        } else {
            attackDescription = `${actor.name.toUpperCase()} hacks ${target.name}`;
        }

        const fg =
            actor === window.engine.player ? Colors.PlayerAttackText : Colors.EnemyAttackText;
        if (damage > 0) {
            window.messageLog.addMessage(
                `${attackDescription} for ${damage} hit points.`,
                fg,
            );
            target.fighter.takeDamage({damageType: damageType, amount: damage});
        } else {
            window.messageLog.addMessage(
                `${attackDescription} but does no damage.`,
                fg,
            );
        }
    }
}

export class BumpAction extends ActionWithDirection {
    perform(entity: Entity, gameMap: GameMap) {
        const destX = entity.x + this.dx;
        const destY = entity.y + this.dy;

        let actor = gameMap.getActorAtLocation(destX, destY)
        if (actor && actor.isAlive) {
            return new MeleeAction(this.dx, this.dy).perform(
                entity as Actor,
                gameMap,
            );
        } else {
            return new MovementAction(this.dx, this.dy).perform(entity, gameMap);
        }
    }
}

export class WaitAction extends Action {
    perform(_entity: Entity) { }
}

export class AlarmAction extends Action {
    perform(entity: Actor, _gameMap: GameMap): void {
        window.messageLog.addMessage(`${entity.name} sends out an alarm`)
        if (window.engine.player!.alarm != null) {
            window.engine.player!.alarm!.increaseLevel()
        }
    }
}

export class PickupAction extends Action {
    perform(entity: Entity, gameMap: GameMap) {
        const consumer = entity as Actor;
        if (!consumer) return;

        const { x, y, inventory } = consumer;

        for (const item of gameMap.items) {
            if (x === item.x && y == item.y) {
                if (inventory.items.length >= inventory.capacity) {
                    throw new ImpossibleException('Your inventory is full.');
                }

                gameMap.removeEntity(item);
                item.parent = inventory;
                inventory.items.push(item);

                window.messageLog.addMessage(`You picked up the ${item.name}!`);
                return;
            }
        }

        throw new ImpossibleException('There is nothing here to pick up.');
    }
}

export class LogAction extends Action {
    constructor(public moveLog: () => void) {
        super();
    }

    perform(_entity: Entity) {
        this.moveLog();
    }
}

export class DisconnectAction extends Action {
    constructor() {
        super()
    }

    perform(_entity: Entity, _gameMap: GameMap): void {
        window.messageLog.addMessage(`You disconnect and connect to a new network`);
        (window.engine.screen as GameScreen).reset()
    }
}

export class ItemAction extends Action {
    constructor(
        public item: Item | null,
        public targetPosition: [number, number] | null = null,
    ) {
        super();
    }

    targetActor(gameMap: GameMap): Actor | undefined {
        if (!this.targetPosition) {
            return;
        }
        const [x, y] = this.targetPosition;
        return gameMap.getActorAtLocation(x, y);
    }

    perform(entity: Entity, gameMap: GameMap) {
        this.item?.consumable?.activate(this, entity, gameMap);
    }
}

export class DropItem extends ItemAction {
    perform(entity: Entity, gameMap: GameMap) {
        const dropper = entity as Actor;
        if (!dropper || !this.item) return;
        dropper.inventory.drop(this.item, gameMap);

        if (dropper.equipment.itemIsEquipped(this.item)) {
            dropper.equipment.toggleEquip(this.item);
        }
    }
}

export class EquipAction extends Action {
    constructor(public item: Item) {
        super();
    }

    perform(entity: Entity, _gameMap: GameMap) {
        const actor = entity as Actor;
        if (!actor) return;
        actor.equipment.toggleEquip(this.item);
    }
}