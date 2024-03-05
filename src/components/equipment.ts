import { Actor, Item } from "../entity";
import { EquipmentType } from "../equipment-types";
import { BaseComponent } from "./base-component";

type Slot = {
    [slotName: string]: Item | null
}
export class Equipment extends BaseComponent {
    parent: Actor | null
    slots: Slot

    constructor(
        software: Item | null = null,
        malware: Item | null = null,
        virus: Item | null = null,
    ) {
        super()
        this.slots = {
            software,
            malware,
            virus,
        }
        this.parent = null
    }

    public get defenseBonus(): number {
        let bonus = 0;
        if (this.slots['software'] && this.slots['software'].equippable) {
            bonus += this.slots['software'].equippable.defenseBonus;
        }
        if (this.slots['malware'] && this.slots['malware'].equippable) {
            bonus += this.slots['malware'].equippable.defenseBonus;
        }
        if (this.slots['virus'] && this.slots['virus'].equippable) {
            bonus += this.slots['virus'].equippable.defenseBonus;
        }
        return bonus;
    }

    public get powerBonus(): number {
        let bonus = 0;
        if (this.slots['software'] && this.slots['software'].equippable) {
            bonus += this.slots['software'].equippable.powerBonus;
        }
        if (this.slots['malware'] && this.slots['malware'].equippable) {
            bonus += this.slots['malware'].equippable.powerBonus;
        }
        if (this.slots['virus'] && this.slots['virus'].equippable) {
            bonus += this.slots['virus'].equippable.powerBonus;
        }
        return bonus;
    }

    itemIsEquipped(item: Item): boolean {
        return this.slots['software'] === item || this.slots['malware'] === item || this.slots['virus'] === item;
    }

    unequipMessage(itemName: string) {
        window.messageLog.addMessage(`You unload ${itemName}.`);
    }

    equipMessage(itemName: string) {
        window.messageLog.addMessage(`You load ${itemName}.`);
    }

    equipToSlot(slot: string, item: Item, addMessage: boolean) {
        const currentItem = this.slots[slot];
        if (currentItem) {
            this.unequipFromSlot(slot, addMessage);
        }
        this.slots[slot] = item;

        if (addMessage) {
            this.equipMessage(item.name);
        }
    }

    unequipFromSlot(slot: string, addMessage: boolean) {
        const currentItem = this.slots[slot];
        if (addMessage && currentItem) {
            this.unequipMessage(currentItem.name);
        }
        this.slots[slot] = null;
    }

    toggleEquip(item: Item, addMessage: boolean = true) {
        let slot = '';
        if (item.equippable && item.equippable.equipmentType === EquipmentType.Software) {
            slot = 'software';
        } else if (item.equippable && item.equippable.equipmentType === EquipmentType.Malware) {
            slot = 'malware';
        } else if (item.equippable && item.equippable.equipmentType === EquipmentType.Virus) {
            slot = 'virus';
        }

        if (this.slots[slot] === item) {
            this.unequipFromSlot(slot, addMessage);
        } else {
            this.equipToSlot(slot, item, addMessage);
        }
    }
}