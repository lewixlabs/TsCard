export default class SmartCard {

    constructor( protected _atr : Array<number>, protected _protocol: number, protected _isMemoryCard : boolean = false){}

    get atr() : Array<number> {
        return this._atr;
    }

    get protocol() : number {
        return this._protocol;
    }

    get isMemoryCard() : boolean {
        return this._isMemoryCard;
    }
}