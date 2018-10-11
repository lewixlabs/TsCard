import * as Pcsc from 'pcsclite';
import Reader from './reader';
import SmartCard from './cards/smartcard';
import { Sle } from './cards/memorycard';
import Utilities from './utilities';

export class TsCard {
    private static _instance : TsCard;
    private _pcsc : Pcsc;
    private _reader : any;

    private readonly _defaultTimeout : number;

    constructor() {

        this._pcsc = new Pcsc();
        this._defaultTimeout = 15000;
        this._reader = null;
    }

    static get instance () : TsCard {

        if (this._instance == null)
            this._instance = new TsCard();

        return this._instance;
    }

    async detectReader(timeout? : number) : Promise<Reader> {

        if (timeout == null)
            timeout = this._defaultTimeout;

        return new Promise<Reader>((resolve,reject) => {

            let cmdTimeout = setTimeout(() => {

                this._pcsc.close();
                reject(`Timeout: no card reader detected after ${timeout}ms`);
            }, timeout);

            this._pcsc.on('reader', reader => {
               
                this._reader = reader;
                clearTimeout(cmdTimeout);
                return resolve(new Reader(reader));
            });

            this._pcsc.on('error', function(err) {

                reject(`PCSC error: ${err}`);
            });
        });
    }

    async insertCard(timeout? : number) : Promise<[boolean,SmartCard?]> {

        if (timeout == null)
            timeout = this._defaultTimeout;

        return new Promise<[boolean,SmartCard?]>((resolve,reject) => {

            let cmdTimeout = setTimeout(() => {

                resolve([false]);
            }, timeout);

            let actualReader = this._reader;

            actualReader.on('status', function(status) {
            
                var changes = this.state ^ status.state;
                if (changes) {
                    if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                        /* card inserted */
                        actualReader.connect({ share_mode : this.SCARD_SHARE_SHARED }, function(err, protocol) {
                            if (err) {

                                reject(`Connect error: ${err}`);
                            } else {

                                clearTimeout(cmdTimeout);
                                if (Sle.isSupportedMemoryCard(actualReader,[...status.atr]))
                                    return resolve([true, new Sle(new Reader(actualReader), [...status.atr], protocol)]);
                                else
                                    return resolve([true,new SmartCard([...status.atr], protocol)]);
                            }
                        });
                    }
                }
            });

            this._pcsc.on('error', function(err) {

                reject(`PCSC error: ${err}`);
            });
        });
    }

    async removeCard(timeout? : number) : Promise<boolean> {

        if (timeout == null)
            timeout = this._defaultTimeout;

        return new Promise<boolean>((resolve,reject) => {

            let cmdTimeout = setTimeout(() => {

                resolve(false);
            }, timeout);

            this._reader.on('status', function(status) {

                var changes = this.state ^ status.state;
                if (changes) {
                    if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                        /* card removed */
                        this._pcsc.reader.disconnect(this._pcsc.reader.SCARD_LEAVE_CARD, function(err) {
                            if (err) {

                                reject(`Disconnect error: ${err}`);
                            } else {

                                resolve(true);
                            }
                        });
                        
                    };            
                };
            });
        });         
    }

    close() : void {
        if (this._reader)
            this._reader.close();
        
        if (this._pcsc)
            this._pcsc.close();
    }

    static rawDemo() : void {

        let pcsc = new Pcsc();
        
        pcsc.on('reader', function(reader) {
        
            console.log('New reader detected', reader.name);
        
            reader.on('error', function(err) {
                console.log('Error(', this.name, '):', err.message);
            });
        
            reader.on('status', function(status) {
                console.log('Status(', this.name, '):', status);
                /* check what has changed */
                var changes = this.state ^ status.state;
                if (changes) {
                    if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                        console.log("card removed");/* card removed */
                        reader.disconnect(reader.SCARD_LEAVE_CARD, function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Disconnected');
                            }
                        });
                    } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                        console.log("card inserted");/* card inserted */
                        reader.connect({ share_mode : this.SCARD_SHARE_SHARED }, function(err, protocol) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Protocol(', reader.name, '):', protocol);
                                console.log('ATR: ', status.atr);
                                
                                
                                
                                reader.transmit(new Buffer([0xFF, 0xA4, 0x00, 0x00, 0x01, 0x05]), 2, protocol, function(err, data) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log('Data received', data);
                                        reader.close();
                                        pcsc.close();
                                    }
                                });
                            }
                        });
                    }
                }
            });
        
            reader.on('end', function() {
                console.log('Reader',  this.name, 'removed');
            });
        });
        
        pcsc.on('error', function(err) {
            console.log('PCSC error', err.message);
        });
    }
}