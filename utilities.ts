
export default class Utilities {

    static bytesToHexString(bytesArray : Array<number>) : string {

        let atrHex : string = "";
        if (bytesArray && bytesArray.length > 0)
            bytesArray.map(val => {
                
                if (val.toString(16).length == 1)
                    atrHex += "0";
                atrHex += val.toString(16);
            });

        return atrHex;
    }

    static hexStringToBytes(str: string): number[] {
        if (!str) {
            return [];
        }

        const numberArray: number[] = [];
        for (let i: number = 0, len = str.length; i < len; i += 2) {
            numberArray.push(parseInt(str.substr(i, 2), 16));
        }

        return numberArray;
    }

    static lowestByteFromShort = (short : number) => short & 0x00FF;
    static highestByteFromShort = (short : number) => (short & 0xFF00) >> 8;
}

