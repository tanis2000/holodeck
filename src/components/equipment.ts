import { Actor, Item } from "../entity";
import { BaseComponent } from "./base-component";

type Slot = {
    [slotName: string]: Item | null
}
export class Equipment extends BaseComponent {
    parent: Actor | null
    slots: Slot

    constructor() {
        super()
        this.slots = {}
        this.parent = null
    }
}