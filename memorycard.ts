enum CardTypes {
    SLE5528 = 0,
    SLE5542 = 1
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
    
    cardtype : CardTypes;

    constructor(prmAtr : Array<number>){
        super();

        this.atr = prmAtr;
        console.log(this.atr.toString());
        switch (this.atr.toString()){

            case "1,2,3,4":
                this.size = 256;
                this.cardtype = CardTypes.SLE5542;
                break;
        }
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