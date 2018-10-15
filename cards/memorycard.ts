import SmartCard  from './smartcard';
import { ApduResponse } from '../reader';
import Utilities from '../utilities';
import Reader from '../reader';

//#region SLE Parameters
enum MemoryCardTypes {
    SLE5528 = 0x05,
    SLE5542 = 0x06
}

interface SleSupported {
    type : MemoryCardTypes
    size : number // size in bytes
}

const ACR38SupportedMemoryCards = new Map<string,SleSupported> ([
        [
            Utilities.bytesToHexString([ 0x3B, 0x04, 0x92, 0x23, 0x10, 0x91 ]), // SLE5528 ATR with ACR38 Reader: 3b492231091
            {
                type: MemoryCardTypes.SLE5528,
                size : 1024
            }
        ],
        [
            Utilities.bytesToHexString([ 0x3B, 0x04, 0xB4, 0x23, 0x10, 0x91 ]), // SLE5528 ATR with ACR38 Reader: 3b4b4231091
            {
                type : MemoryCardTypes.SLE5528,
                size : 1024
            }
        ],
        [
            Utilities.bytesToHexString([ 0x3B, 0x04, 0xA2, 0x13, 0x10, 0x91 ]), // SLE5542 ATR with ACR38 Reader: 3b4a2131091
            {
                type : MemoryCardTypes.SLE5542,
                size : 256
            }
        ]
]);
//#endregion


interface IMemoryCard {
     readBytes(offset: number, length: number) : Promise<[boolean,Array<number>]>;
     writeBytes(offset: number, length: number, buffer: number) : Promise<boolean>;
     verifyPSC(psc: Array<number>) : boolean;
}

abstract class MemoryCard extends SmartCard implements IMemoryCard {

    abstract readBytes(offset: number, length: number) : Promise<[boolean,Array<number>]>;
    abstract writeBytes(offset: number, length: number, buffer: number) : Promise<boolean>;
    abstract verifyPSC(psc: Array<number>) : boolean;
}

export class Sle extends MemoryCard {
    
    private _cardType : MemoryCardTypes;
    private _size : number;
    private _reader : Reader;
    private _initialized : boolean;

    constructor(reader : Reader, atr : Array<number>, protocol : number){
        super(atr, protocol, true);

        this._initialized = false;
        this._reader = reader;
                     
        let atrHex : string = Utilities.bytesToHexString(atr);
        this._cardType = ACR38SupportedMemoryCards.get(atrHex).type;
        this._size = ACR38SupportedMemoryCards.get(atrHex).size;
    }

    static isSupportedMemoryCard(reader : any, atr : Array<number>) : boolean {
        let readerSupported = false;
        let isMemoryCard = false;

        // reader check
        if (reader && reader.name && typeof(reader.name) === "string")
            readerSupported = reader.name.toUpperCase().includes("ACR 38") || reader.name.toUpperCase().includes("ACR38");

        // atr check
        if (atr){

            let atrHex : string = Utilities.bytesToHexString(atr);
            isMemoryCard = ACR38SupportedMemoryCards.has(atrHex);         
        }
            
        return (readerSupported && isMemoryCard);
    }

    async init() : Promise<boolean> {

        return new Promise<boolean>(async (resolve,reject) => {

            if (this._initialized)
                resolve(true);

            let actualReader = this._reader;
            let actualCardType = this._cardType.valueOf();

            try {

                let apduResult : ApduResponse = await this._reader.sendApdu(
                    this,
                    {
                        Cla: 0xFF,
                        Ins: 0xA4,
                        P1: 0x00,
                        P2: 0x00,
                        Le: 0,
                        Lc: 1
                    },
                    [this._cardType.valueOf()]
                );

                resolve(apduResult.SW[0] == 0x90 && apduResult.SW[1] ==  0x00 ? true : false);
            } catch (error) {
                reject(error);
            }
        });
    }

    get type() {
        return this._cardType;
    }
    
    get size(){
        return this._size;
    }

    async readBytes(offset: number, length: number) : Promise<[boolean,Array<number>]> {
        
        return new Promise<[boolean,Array<number>]>(async (resolve,reject) => {
    
            try {

                let canRead : boolean = await this.init();
                if (!canRead)
                    reject([false,null]);
            }
            catch (initError){

                reject(initError);
            }


            try {

                let apduResult : ApduResponse = await this._reader.sendApdu(
                    this,
                    {
                        Cla: 0xFF,
                        Ins: 0xB0,
                        P1: Utilities.highestByteFromShort(offset),
                        P2: Utilities.lowestByteFromShort(offset),
                        Le: 2 /* SW */ + length,
                        Lc: length /* length byte */
                    },
                    null
                );

                resolve([apduResult.SW[0] == 0x90 && apduResult.SW[1] == 0x00 ? true : false, apduResult.Data]);
            } catch (error) {
                reject(error);
            }
        });
    }
    async writeBytes(offset: number, length: number) : Promise<boolean> {
        
        return new Promise<boolean>(async (resolve,reject) => {
    
            try {

                let canRead : boolean = await this.init();
                if (!canRead)
                    reject([false,null]);
            }
            catch (initError){
                reject(initError);
            }

            try {

                let apduResult : ApduResponse = await this._reader.sendApdu(
                    this,
                    {
                        Cla: 0xFF,
                        Ins: 0xD0,
                        P1: Utilities.highestByteFromShort(offset),
                        P2: Utilities.lowestByteFromShort(offset),
                        Le: 2 /* SW */ + length,
                        Lc: length /* length byte */
                    },
                    null
                );

                resolve(apduResult.SW[0] == 0x90 && apduResult.SW[1] == 0x00 ? true : false);
            } catch (error) {
                reject(error);
            }
        });
    }
 
    verifyPSC(psc: Array<number>) : boolean {
        return true;
    }
}