export class PlayerInfo {
    _name: String = ''

    public setName(value: String) {
        this._name = value
    }

    public get name() {
        return this._name
    }
}