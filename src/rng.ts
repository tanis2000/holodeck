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
    [1, 2],
    [4, 3],
    [6, 5],
];

export const MAX_ITEMS_BY_LEVEL: LevelValue = [
    [1, 1],
    [4, 2],
];

export const ENEMIES_CHANCES: WeightedChoices[] = [
    {
        level: 1,
        weights: [{ value: 'spawnSurveillanceTurret', weight: 80 }],
    },
    {
        level: 1,
        weights: [{ value: 'spawnServer', weight: 100 }],
    },
];

export const ITEMS_CHANCES: WeightedChoices[] = [
    {
        level: 1,
        weights: [
            {value: 'spawnEmp', weight: 100},
            {value: 'spawnNotepad', weight: 25},
            {value: 'spawnAgentTesla', weight: 50},
        ]
    }
]

export function generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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