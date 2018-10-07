enum CardTypes {
    SLE5528,
    SLE5542
}

interface IMemoryCard {
     readBytes(offset: number, length: number) : Array<number>;
     writeBytes(offset: number, length: number, buffer: number) : boolean;
     verifyPSC(psc: Array<number>) : boolean;
}

abstract class MemoryCard implements IMemoryCard {
    atr: Array<number>;
    size: number;

    abstract readBytes(offset: number, length: number) : Array<number>;
    abstract writeBytes(offset: number, length: number, buffer: number) : boolean;
    abstract verifyPSC(psc: Array<number>) : boolean;
}

export class Sle extends MemoryCard {
    
    private _cardType : CardTypes;

    constructor(prmAtr : Array<number>){
        super();

        this.atr = prmAtr;
        console.log(this.atr.toString());
        switch (this.atr.toString()){

            case "1,2,3,4":
                this.size = 256;
                this._cardType = CardTypes.SLE5542;
                break;
        }
    }

     get cardType() {
         return this._cardType;
     }
     

    readBytes(offset: number, length: number) : Array<number> {
        return null;
    }

    writeBytes(offset: number, length: number, buffer: number) : boolean {
        return true;
    }

    verifyPSC(psc: Array<number>) : boolean {
        return true;
    }
}