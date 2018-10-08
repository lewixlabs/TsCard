import * as Pcsc from "pcsclite";

export class TsPcscLite {
    private static _instance : TsPcscLite;
    private _pcsc : Pcsc;

    constructor() {

        this._pcsc = new Pcsc();
    }

    greeting: string;
 
    greet() {
        return "Hello, " + this.greeting;
    }

    static get instance () : TsPcscLite {

        if (this._instance == null)
            this._instance = new TsPcscLite();

        return this._instance;
    }

    async detectReader() : Promise<string> {


        // return new Promise<string>(resolve => {
    
        //     setTimeout(() => {

        //         resolve("ok detectReader");
        //     }, 3000);
            
        // });

        return new Promise<string>(resolve => {
            
            this._pcsc.on('reader', function(reader) {
                return resolve(reader.name);
            });
        });
    }

    close() : void {
        this._pcsc.close();
    }
}