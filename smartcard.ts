export default class SmartCard {

    constructor( protected _atr : Array<number>, protected _protocol: number){}

    get atr() : Array<number> {
        return this._atr;
    }

    get protocol() : number {
        return this._protocol;
    }
}