import * as ROT from 'rot-js'

type LevelValue = [number, number][];

type Choice = {
    value: string;
    weight: number;
};

type WeightedChoices = {
    level: number;
    weights: Choice[];
};

type WeightMap = {
    [key: string]: number;
};

export const MAX_ENEMIES_BY_LEVEL: LevelValue = [
    [1, 1],
    [4, 2],
    [6, 4],
];

export const MAX_ITEMS_BY_LEVEL: LevelValue = [
    [1, 1],
    [4, 2],
];

export const ENEMIES_CHANCES: WeightedChoices[] = [
    {
        level: 1,
        weights: [
            { value: 'spawnSurveillanceTurret', weight: 80 },
            { value: 'spawnServer', weight: 100 },
        ],
    },
    {
        level: 2,
        weights: [
            { value: 'spawnDrone', weight: 100 },
        ],
    },
    {
        level: 4,
        weights: [
            { value: 'spawnNAS', weight: 40 },
        ],
    },
    {
        level: 6,
        weights: [
            { value: 'spawnMainframe', weight: 20 },
        ],
    },
];

export const ITEMS_CHANCES: WeightedChoices[] = [
    {
        level: 1,
        weights: [
            {value: 'spawnEmp', weight: 100},
            {value: 'spawnNotepad', weight: 25},
            {value: 'spawnAgentTesla', weight: 15},
        ]
    },
    {
        level: 2,
        weights: [
            {value: 'spawnEmp', weight: 20},
            {value: 'spawnHealthPotion', weight: 10},
            {value: 'spawnGrenade', weight: 15},
            {value: 'spawnClippy', weight: 20},
            {value: 'spawnFormBook', weight: 20},
            {value: 'spawnILoveYou', weight: 20},
        ]
    },
    {
        level: 3,
        weights: [
            {value: 'spawnLokiBot', weight: 50},
            {value: 'spawnMyDoom', weight: 50},
            {value: 'spawnSlammer', weight: 50},
        ]
    },
]

export function generateRandomNumber(min: number, max: number) {
    return Math.floor(ROT.RNG.getUniform() * (max - min + 1) + min);
}


export function getMaxValueForLevel(
    maxValueByLevel: LevelValue,
    level: number,
): number {
    let current = 0;

    for (let [min, value] of maxValueByLevel) {
        if (min > level) break;
        current = value;
    }

    return current;
}

export function getWeights(
    chancesByLevel: WeightedChoices[],
    levelNumber: number,
): WeightMap {
    let current: WeightMap = {};

    for (let { level, weights } of chancesByLevel) {
        if (level > levelNumber) break;

        for (let { value, weight } of weights) {
            current[value] = weight;
        }
    }

    return current;
}