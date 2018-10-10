
export default class Utilities {

    static BytesToHexString(bytesArray : Array<number>) : string {

        let atrHex : string = "";
        if (bytesArray && bytesArray.length > 0)
            bytesArray.map(val => {
                atrHex += val.toString(16);
            });

        return atrHex;
    }
}

