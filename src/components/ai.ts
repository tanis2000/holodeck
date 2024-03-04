import * as ROT from 'rot-js'
import { Entity } from "../entity";
import { GameMap } from "../game-map";

export abstract class BaseAI {
    path: [number, number][]
    constructor() {
        this.path = []
    }

    abstract perform(): void

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
