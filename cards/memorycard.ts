import SmartCard  from './smartcard';
import { ApduResponse } from '../reader';
import Utilities from '../utilities';
import Reader from '../reader';

//#region SLE Parameters
export enum MemoryCardTypes {
    SLE5528 = 0x05,
    SLE5542 = 0x06
}

interface SleSupported {
    type : MemoryCardTypes
    size : number // size in bytes
}

export enum PINStatus {
    NOT_VERIFIED,
    OK,
    WRONG,
    LOCKED
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
     writeBytes(offset: number, buffer: Array<number>) : Promise<boolean>;
     verifyPIN(pin: Array<number>) : Promise<[PINStatus, number /* error counter */]>;
}

abstract class MemoryCard extends SmartCard implements IMemoryCard {

    abstract readBytes(offset: number, length: number) : Promise<[boolean,Array<number>]>;
    abstract writeBytes(offset: number, buffer: Array<number>) : Promise<boolean>;
    abstract verifyPIN(pin: Array<number>) : Promise<[PINStatus, number /* error counter */]>;
}

export class Sle extends MemoryCard {
    
    private _cardType : MemoryCardTypes;
    private _size : number;
    private _reader : Reader;
    private _initialized : boolean;
    private _pinStatus : PINStatus;

    constructor(reader : Reader, atr : Array<number>, protocol : number){
        super(atr, protocol, true);

        this._initialized = false;
        this._reader = reader;
                     
        let atrHex : string = Utilities.bytesToHexString(atr);
        this._cardType = ACR38SupportedMemoryCards.get(atrHex).type;
        this._size = ACR38SupportedMemoryCards.get(atrHex).size;
        this._pinStatus = PINStatus.NOT_VERIFIED;
    }

    static isSupportedMemoryCard(reader : any, atr : Array<number>) : boolean {
        let readerSupported = false;
        let isMemoryCard = false;

        // reader check
        if (reader && reader.name && typeof(reader.name) === "string")
            readerSupported = reader.name.toUpperCase().includes("ACR 38") || reader.name.toUpperCase().includes("ACR38") || reader.name.toUpperCase().includes("ACS");

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
    async writeBytes(offset: number, buffer: Array<number>) : Promise<boolean> {
        
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
                        Le: 0,
                        Lc: buffer.length /* length byte */
                    },
                    buffer
                );

                resolve(apduResult.SW[0] == 0x90 && apduResult.SW[1] == 0x00 ? true : false);
            } catch (error) {
                reject(error);
            }
        });
    }
 
    async verifyPIN(pin: Array<number>) : Promise<[PINStatus, number /* error counter */]> {

        return new Promise<[PINStatus, number]>(async (resolve,reject) => {
    
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
                        Ins: 0x20,
                        P1: 0x00,
                        P2: 0x00,
                        Le: 0,
                        Lc: this._cardType == MemoryCardTypes.SLE5528 ? 2 : 3 /* length byte */
                    },
                    pin
                );

                /*
                 * SW1 =90H
                 * SW2 (ErrorCnt) = Error Counter.
                 * 
                 * SLE5528
                 * - FF H indicates the verification is correct.
                 * - 00 H indicates the password is locked (exceeded the maximum number of retries).
                 * - Other values indicate the current verification failed.
                 * 
                 * SLE5542
                 * SW2 (ErrorCnt) = Error Counter.
                 * 07H indicates the verification is correct.
                 * 00H indicates the password is locked (exceeded the maximum number of retries).
                 * Other values indicate the current verification failed.
                */
                let verifyResult : PINStatus = PINStatus.WRONG;
                switch (apduResult.SW[1]) {

                    // for SLE5528 only
                    case 0xFF:
                        if (apduResult.SW[0] == 0x90 && this._cardType == MemoryCardTypes.SLE5528)
                            verifyResult = PINStatus.OK;
                        break;

                    // for SLE5542 only
                    case 0x07:
                        if (apduResult.SW[0] == 0x90 && this._cardType == MemoryCardTypes.SLE5542)
                            verifyResult = PINStatus.OK;
                        break;

                    case 0x00:
                        verifyResult = PINStatus.LOCKED;
                        break;
                }
                let errorCounter : number = apduResult.SW[1];

                resolve([verifyResult, errorCounter]);
            } catch (error) {
                reject(error);
            }
        });
    }
}