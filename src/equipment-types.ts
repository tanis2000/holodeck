export enum EquipmentType {
    Software,
    Malware,
    Virus,
}

export function equipmentTypeToString(equipmentType: EquipmentType): String {
    switch (equipmentType) {
        case EquipmentType.Software:
            return "Software"
            break;
        case EquipmentType.Malware:
            return "Malware"
            break;
        case EquipmentType.Virus:
            return "Virus"
            break;
        default:
            break;
    }
    return ``
}