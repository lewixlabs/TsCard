import SmartCard  from './smartcard';
import { ApduResponse } from './reader';



enum MemoryCardTypes {
    SLE5528 = 0x05,
    SLE5542 
}

// SLE5528 ATR with ACR38 Reader: 3b492231091
export const ATR_SLE5528 : Array<number> = [ 0x92, 0x23, 0x10, 0x91 ];

// SLE5542 ATR with ACR38 Reader: 3b4a2131091
export const ATR_SLE5542 : Array<number> = [ 0xA2, 0x13, 0x10, 0x91 ];

const sizeMap = new Map<MemoryCardTypes,number>([
    [MemoryCardTypes.SLE5528,1024],
    [MemoryCardTypes.SLE5542,256]
]);

interface IMemoryCard {
     readBytes(offset: number, length: number) : Array<number>;
     writeBytes(offset: number, length: number, buffer: number) : boolean;
     verifyPSC(psc: Array<number>) : boolean;
}

abstract class MemoryCard extends SmartCard implements IMemoryCard {

    abstract readBytes(offset: number, length: number) : Array<number>;
    abstract writeBytes(offset: number, length: number, buffer: number) : boolean;
    abstract verifyPSC(psc: Array<number>) : boolean;
}

export class Sle extends MemoryCard {
    
    private _cardType : MemoryCardTypes;
    private _size : number;
    private _reader : any;

    constructor(reader : any, atr : Array<number>, protocol : number){
        super(atr,protocol);

        this._reader = reader;

        console.log(this._atr.toString());
        switch (this._atr.toString()){

            case "1,2,3,4":
                this._cardType = MemoryCardTypes.SLE5542;
                this._size = sizeMap.get(this._cardType);
                
                break;
        }

        this.init(this._cardType);
    }

    private async init(cardType : MemoryCardTypes) : Promise<boolean> {

        return new Promise<boolean>(async (resolve,reject) => {

            try {

                let apduResult : ApduResponse = await this._reader.sendApdu(
                    this,
                    {
                        Cla: 0xFF,
                        Ins: 0xA4,
                        P1: 0x00,
                        P2: 0x00,
                        Le: 0
                    },
                    this._cardType
                );

                resolve(apduResult.SW == [0x90, 0x00] ? true : false);
            } catch (error) {
                reject(error);
            }
        });
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