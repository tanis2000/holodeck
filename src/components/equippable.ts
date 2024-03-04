import { Item } from "../entity";

export abstract class Equippable {
    constructor(public parent: Item | null){}
}