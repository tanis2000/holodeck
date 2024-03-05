import { Colors } from "./colors";
import { Entity, Actor } from "./entity";
import { ImpossibleException } from "./exceptions";
import { GameMap } from "./game-map";

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
        const destX = actor.x + this.dx;
        const destY = actor.y + this.dy;

        const target = gameMap.getActorAtLocation(destX, destY);
        if (!target) {
            throw new ImpossibleException('Nothing to hack.');
        }

        const damage = actor.fighter.power - target.fighter.defense;
        const attackDescription = `${actor.name.toUpperCase()} hacks ${target.name
            }`;

        const fg =
            actor === window.engine.player ? Colors.PlayerAttackText : Colors.EnemyAttackText;
        if (damage > 0) {
            window.messageLog.addMessage(
                `${attackDescription} for ${damage} hit points.`,
                fg,
            );
            target.fighter.hp -= damage;
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

        if (gameMap.getActorAtLocation(destX, destY)) {
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
    perform(/*entity: Entity, gameMap: GameMap*/) {
        //   const consumer = entity as Actor;
        //   if (!consumer) return;

        //   const { x, y, inventory } = consumer;

        //   for (const item of gameMap.items) {
        //     if (x === item.x && y == item.y) {
        //       if (inventory.items.length >= inventory.capacity) {
        //         throw new ImpossibleException('Your inventory is full.');
        //       }

        //       gameMap.removeEntity(item);
        //       item.parent = inventory;
        //       inventory.items.push(item);

        //       window.messageLog.addMessage(`You picked up the ${item.name}!`);
        //       return;
        //     }
        //   }

        //   throw new ImpossibleException('There is nothing here to pick up.');
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