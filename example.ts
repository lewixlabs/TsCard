import { TsCard } from './index';
import Reader, { ApduResponse } from './reader';
import SmartCard from './cards/smartcard';
import { Sle } from './cards/memorycard';
import Utilities from './utilities';

class Example {
    static rawTest(){
        //TsCard.rawDemo();
    }

    static async main() {

        console.log("Example started...");
        let tsPcsc = TsCard.instance;
        console.log("Waiting for reader plugged...");

        try {

            let cardReader : Reader = await tsPcsc.detectReader(15000);
            if (cardReader != null) {

                console.log(`Reader detected:${cardReader.name}`);

                let cardInfo : [boolean , SmartCard?] = await tsPcsc.insertCard(15000);
                if (cardInfo[0]){

                    let atrHex : string = "";
                    cardInfo[1].atr.map(val => {
                        atrHex += val.toString(16);
                    });
                    console.log(`Smartcard inserted:${cardInfo["0"]}\nSmartCard ATR: ${Utilities.bytesToHexString(cardInfo[1].atr)}`);
                    
                    console.log(`Is SmartCard Object? ${cardInfo[1] instanceof SmartCard}`);
                    console.log(`Is Sle Object? ${cardInfo[1] instanceof Sle}`);
                    console.log(`Is Memory Card:${cardInfo[1].isMemoryCard}`)
                }
                    
                else
                    console.log(`Smartcard inserted:${cardInfo["0"]}`);

                if (!cardInfo[1].isMemoryCard) {

                    console.log("Read MasterFile DF...");
                    let apduResult : ApduResponse = await cardReader.sendApdu(
                        cardInfo[1],
                        {
                            Cla: 0x00,
                            Ins: 0xA4,
                            P1: 0x00,
                            P2: 0x00,
                            Le: 80,
                            Lc: 0x02
                        },
                        [ 0x3F, 0x00]
                    );
                    console.log(`SW: ${apduResult.SW}\nData Received: ${Utilities.bytesToHexString(apduResult.Data)}`);
                } else {

                    if (cardInfo[1] instanceof Sle){

                        const bytesToRead : number = 224;
                        console.log(`reading ${bytesToRead} bytes from offset #32...`);
                        let mySle = cardInfo[1] as Sle;
                        let retRead = await mySle.readBytes(32, bytesToRead);
                        console.log(`SLE Read Result: ${retRead[0]}\nBytes Read: ${Utilities.bytesToHexString(retRead[1])}`);

                        console.log("verify PIN");
                        let myPIN : Array<number> = [ 0x12, 0x34 ];
                        let retVerify = await mySle.verifyPIN(myPIN);
                        console.log(`SLE Verify Result: ${retVerify[0]}\nError Counter: ${Utilities.bytesToHexString([retVerify[1]])}`);

                        console.log("writing 4 bytes from offset #32...");
                        let myBuffer : Array<number> = [ 0xAB, 0xCD, 0xDE, 0xF0 ];
                        let retWrite = await mySle.writeBytes(32,myBuffer);
                        console.log(`SLE Write Result: ${retWrite}`);
                    }
                }
            }
        }
        catch (error) {
            console.log(`Error!\n${error}`)
        }
        finally {

            tsPcsc.close();
            console.log("Example completed...");    
        }
        
        console.log("Reader closed");
    }
}

//Example.rawTest();
Example.main();
