import * as ROT from 'rot-js'
import { Actor, Entity } from "../entity";
import { GameMap } from "../game-map";
import { AlarmAction, WaitAction } from '../actions';

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
