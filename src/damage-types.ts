export enum DamageType {
    BareHands,
    Software,
    Electricity,
    Fire,
}

export type DamageInfo = {
    damageType: DamageType
    amount: number
}