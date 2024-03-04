import { Actor, Item } from "../entity";
import { BaseComponent } from "./base-component";

export class Inventory extends BaseComponent {
    parent: Actor | null
    items: Item[]

    constructor(
        public capacity: number,
    ) {
        super()
        this.parent = null
        this.items = []
    }

}