export enum DamageType {
    BareHands,
    Software,
    Electricity,
}

export type DamageInfo = {
    damageType: DamageType
    amount: number
}