export default class SmartCard {

    constructor( private _atr : Array<number>, private _protocol: number){

    }

    get atr() : Array<number> {
        return this._atr;
    }

    get protocol() : number {
        return this._protocol;
    }
}