import * as Pcsc from "pcsclite";

export class TsPcscLite {
    private static _instance : TsPcscLite;
    private _pcsc : Pcsc;

    private readonly _defaultTimeout;

    constructor() {

        this._pcsc = new Pcsc();
        this._defaultTimeout = 15000;
    }

    static get instance () : TsPcscLite {

        if (this._instance == null)
            this._instance = new TsPcscLite();

        return this._instance;
    }

    async detectReader(timeout? : number) : Promise<string> {

        if (timeout == null)
            timeout = this._defaultTimeout;

        return new Promise<string>((resolve,reject) => {

            let cmdTimeout = setTimeout(() => {

                this._pcsc.close();
                reject(`Timeout: no card reader detected after ${timeout}ms`);
            }, timeout);

            this._pcsc.on('reader', function(reader) {
               
                clearTimeout(cmdTimeout);
                return resolve(reader.name);
            });
        });
    }

    close() : void {
        this._pcsc.close();
    }

    // static RawDemo() : void {

    //     let pcsc = new Pcsc();
        
    //     pcsc.on('reader', function(reader) {
        
    //         console.log('New reader detected', reader.name);
        
    //         reader.on('error', function(err) {
    //             console.log('Error(', this.name, '):', err.message);
    //         });
        
    //         reader.on('status', function(status) {
    //             console.log('Status(', this.name, '):', status);
    //             /* check what has changed */
    //             var changes = this.state ^ status.state;
    //             if (changes) {
    //                 if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
    //                     console.log("card removed");/* card removed */
    //                     reader.disconnect(reader.SCARD_LEAVE_CARD, function(err) {
    //                         if (err) {
    //                             console.log(err);
    //                         } else {
    //                             console.log('Disconnected');
    //                         }
    //                     });
    //                 } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
    //                     console.log("card inserted");/* card inserted */
    //                     reader.connect({ share_mode : this.SCARD_SHARE_SHARED }, function(err, protocol) {
    //                         if (err) {
    //                             console.log(err);
    //                         } else {
    //                             console.log('Protocol(', reader.name, '):', protocol);
    //                             console.log('ATR: ', status.atr);
                                
                                
                                
    //                             reader.transmit(new Buffer([0xFF, 0xA4, 0x00, 0x00, 0x01, 0x06]), 40, protocol, function(err, data) {
    //                                 if (err) {
    //                                     console.log(err);
    //                                 } else {
    //                                     console.log('Data received', data);
    //                                     reader.close();
    //                                     pcsc.close();
    //                                 }
    //                             });
    //                         }
    //                     });
    //                 }
    //             }
    //         });
        
    //         reader.on('end', function() {
    //             console.log('Reader',  this.name, 'removed');
    //         });
    //     });
        
    //     pcsc.on('error', function(err) {
    //         console.log('PCSC error', err.message);
    //     });
    // }
}