import SmartCard from "./cards/smartcard";

export interface Apdu {
    Cla : number;
    Ins : number;
    P1 : number;
    P2 : number;
    Le : number;
}

export interface ApduResponse {
    SW : Array<number>;
    Data? : Array<number>;
}

export default class Reader {

    private readonly _defaultTimeout : number;

    constructor(private _pcscReader : any) {

        this._defaultTimeout = 8000;
    }

    get name() {
        return this._pcscReader.name;
    }

    async sendApdu(card : SmartCard, cmd : Apdu, dataIn : Array<number>, timeout? : number) : Promise<ApduResponse> {

        if (timeout == null)
            timeout = this._defaultTimeout;

        return new Promise<ApduResponse>((resolve,reject) => {

            let cmdTimeout = setTimeout(() => {

                reject(`Timeout: no apdu response after ${timeout}ms`);
            }, timeout);

            let apduBuffer : Array<number> = [cmd.Cla, cmd.Ins, cmd.P1, cmd.P2];
            apduBuffer.push(...dataIn);
            
            //this._pcscReader.transmit(new Buffer([0xFF, 0xA4, 0x00, 0x00, 0x01, 0x06]), 40, card.protocol, function(err, data) {
            this._pcscReader.transmit(Buffer.from(apduBuffer), cmd.Le, card.protocol, function(err, data) {
                if (err) {
                    reject(`Apdu error: ${err}`);
                } else {
                    let bytesArray : Array<number> = [...data];
                    let sw = [ bytesArray[bytesArray.length-2], bytesArray[bytesArray.length-1]];
                    let receivedData = bytesArray.slice(0,bytesArray.length-2);
                    resolve({SW: sw,Data: receivedData});
                }
            });
        });
    }

    close () {

        if (this._pcscReader)
            this._pcscReader.close();
    }
    
}