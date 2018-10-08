// For Node/CommonJS
// https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
//declare function require(path: string): any;

import * as Pcsc from 'pcsclite';
import { TsPcscLite } from './index';

export class MemoryCardManager {

    static async WaitForReader() {

        console.log("WaitForReader");
        let tsPcsc = TsPcscLite.instance;
        let readerName : string = await tsPcsc.detectReader();
        console.log(readerName);

        tsPcsc.close();
    }

    private static async _Dummy() : Promise<string> {
        return new Promise<string>(resolve => {
    
            setTimeout(() => {

                resolve("ok RESOLVED");
            }, 3000);
            
        });
    }
    
    static async Uff()  {
    
        let tmp = await this._Dummy();
        console.log(tmp);
    }

    // static WaitForSle() : void{

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
