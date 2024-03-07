import * as ROT from 'rot-js'
import { Actor, Entity } from "../entity";
import { GameMap } from "../game-map";
import { AlarmAction, MeleeAction, MovementAction, WaitAction } from '../actions';

export abstract class BaseAI {
    path: [number, number][]
    constructor() {
        this.path = []
    }

    abstract perform(entity: Entity, gameMap: GameMap): void

    calculatePathTo(
        destX: number,
        destY: number,
        entity: Entity,
        gameMap: GameMap,
    ) {
        const isPassable = (x: number, y: number) => gameMap.tileIsWalkable(x, y);
        const dijkstra = new ROT.Path.Dijkstra(destX, destY, isPassable, {});

        this.path = [];

        dijkstra.compute(entity.x, entity.y, (x: number, y: number) => {
            this.path.push([x, y]);
        });
        this.path.shift();
    }
}

export class TurretAI extends BaseAI {
    constructor(public alarmRange: number) {
        super()
    }

    perform(entity: Entity, gameMap: GameMap): void {
        entity.sightRange = this.alarmRange
        const target = window.engine.player!;
        const dx = target.x - entity.x;
        const dy = target.y - entity.y;
        const distance = Math.max(Math.abs(dx), Math.abs(dy));

        if (gameMap.tileIsVisible(entity.x, entity.y)) {
            if (distance < this.alarmRange) {
                return new AlarmAction().perform(entity as Actor, gameMap);
            }
        }

        return new WaitAction().perform(entity);
    }
}

export class HostileAI extends BaseAI {
    constructor() {
        super();
    }

    perform(entity: Entity, gameMap: GameMap) {
        const target = window.engine.player!;
        const dx = target.x - entity.x;
        const dy = target.y - entity.y;
        const distance = Math.max(Math.abs(dx), Math.abs(dy));

        if (gameMap.tileIsVisible(entity.x, entity.y)) {
            if (distance <= 1) {
                return new MeleeAction(dx, dy).perform(entity as Actor, gameMap);
            }
            this.calculatePathTo(target.x, target.y, entity, gameMap);
        }

        if (this.path.length > 0) {
            const [destX, destY] = this.path[0];
            this.path.shift();
            return new MovementAction(destX - entity.x, destY - entity.y).perform(
                entity,
                gameMap,
            );
        }

        return new WaitAction().perform(entity);
    }
}
