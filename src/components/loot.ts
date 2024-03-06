import { spawnMap } from "../entity";
import { getWeights, ITEMS_CHANCES } from "../rng";
import { BaseComponent } from "./base-component";
import * as ROT from 'rot-js'

const DIRECTIONS = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
]

export class Loot extends BaseComponent {
    constructor() {
        super()
    }

    drop() {
        const numberOfItemsToAdd = 1; //generateRandomNumber(0, getMaxValueForLevel(MAX_ITEMS_BY_LEVEL, window.engine.player!.level.currentLevel))
        for (let i = 0; i < numberOfItemsToAdd; i++) {
            const startingPoint = [this.parent!.x, this.parent!.y]
            for (let d of DIRECTIONS) {
                let spawnPoint = [startingPoint[0] + d[0], startingPoint[1] + d[1]]
                let x = spawnPoint[0]
                let y = spawnPoint[1]
                if (this.gameMap?.tileIsWalkable(x, y) && !this.gameMap.entities.some((e) => e.x == x && e.y == y)) {
                    const weights = getWeights(ITEMS_CHANCES, window.engine.player!.level.currentLevel);
                    const spawnType = ROT.RNG.getWeightedValue(weights);
                    if (spawnType) {
                        spawnMap[spawnType](this.gameMap, x, y);
                    }
                    break;
                }
            }
        }

    }
}