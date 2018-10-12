
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

    static lowestByteFromShort = (short : number) => short & 0x00FF;
    static highestByteFromShort = (short : number) => (short & 0xFF00) >> 8;
}

