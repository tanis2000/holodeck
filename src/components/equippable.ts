import { Item } from "../entity";
import { EquipmentType } from "../equipment-types";
import { BaseComponent } from "./base-component";

export class Equippable extends BaseComponent {
    parent: Item | null
    constructor(
        public equipmentType: EquipmentType,
        public powerBonus: number = 0,
        public defenseBonus: number = 0,
    ){
        super()
        this.parent = null
    }
}

export class Notepad extends Equippable {
    constructor() {
        super(EquipmentType.Software, 0, 1)
    }
}

export class Clippy extends Equippable {
    constructor() {
        super(EquipmentType.Software, 0, 2)
    }
}

export class AgentTesla extends Equippable {
    constructor() {
        super(EquipmentType.Malware, 1, 0)
    }
}

export class FormBook extends Equippable {
    constructor() {
        super(EquipmentType.Malware, 2, 0)
    }
}

export class LokiBot extends Equippable {
    constructor() {
        super(EquipmentType.Malware, 3, 0)
    }
}

export class ILoveYou extends Equippable {
    constructor() {
        super(EquipmentType.Virus, 1, 0)
    }
}

export class MyDoom extends Equippable {
    constructor() {
        super(EquipmentType.Virus, 2, 0)
    }
}

export class Slammer extends Equippable {
    constructor() {
        super(EquipmentType.Virus, 3, 0)
    }
}
