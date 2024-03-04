import { Item } from "../entity";

export abstract class Consumable {
    constructor(public parent: Item | null) {
        
    }
}