import SmartCard  from './smartcard';
import { ApduResponse } from '../reader';
import Utilities from '../utilities';
import Reader from '../reader';



enum MemoryCardTypes {
    SLE5528 = 0x05,
    SLE5542 
}

const SupportedSle : Array<Array<number>> = [
    [ 0x92, 0x23, 0x10, 0x91 ], // SLE5528 ATR with ACR38 Reader: 3b492231091
    [ 0xB4, 0x23, 0x10, 0x91 ], // SLE5528 ATR with ACR38 Reader: 3b4b4231091
    [ 0xA2, 0x13, 0x10, 0x91 ]  // SLE5542 ATR with ACR38 Reader: 3b4a2131091
]

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

    constructor(reader : Reader, atr : Array<number>, protocol : number){
        super(atr, protocol, true);

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

    static isSupportedMemoryCard(reader : any, atr : Array<number>) : boolean {
        let readerSupported = false;
        let isMemoryCard = false;

        // reader check
        if (reader && reader.name && typeof(reader.name) === "string")
            readerSupported = reader.name.toUpperCase().includes("ACR 38") || reader.name.toUpperCase().includes("ACR38");

        // atr check
        if (atr){

            let atrHex : string = Utilities.BytesToHexString(atr);

            isMemoryCard = SupportedSle.some(currentAtr => {

                if (atrHex.includes(Utilities.BytesToHexString(currentAtr)))
                    return true;
            });            
        }
            
        return (readerSupported && isMemoryCard);
    }

    private async init(cardType : MemoryCardTypes) : Promise<boolean> {

        let actualReader = this._reader;
        let actualCardType = cardType;
        return new Promise<boolean>(async (resolve,reject) => {

            try {

                let apduResult : ApduResponse = await actualReader.sendApdu(
                    this,
                    {
                        Cla: 0xFF,
                        Ins: 0xA4,
                        P1: 0x00,
                        P2: 0x00,
                        Le: 80
                    },
                    [[0x05]]
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