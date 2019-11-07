import { TsCard } from './index';
import Reader, { ApduResponse } from './reader';
import SmartCard from './cards/smartcard';
import { Sle } from './cards/memorycard';
import Utilities from './utilities';

class Example {
    static async eventTest(){

        console.log("Event example started...");
        let tsPcsc = TsCard.instance;
        console.log("Waiting for reader plugged...");

        try {

            let cardReader : Reader = await tsPcsc.detectReader(15000);
            if (cardReader != null) {

                console.log(`Reader detected:${cardReader.name}`);

                tsPcsc.onCardEvent((ev,crd,error) => {
                    console.log(`CardEvent: ${ev}`);
                });
            }
        }
        catch (error) {
            console.log(`Error!\n${error}`)
        }
        finally {

            setTimeout(() => {

                tsPcsc.close();
                console.log("Event Example completed...");    
            },15000);
        }
    }

    static async main() {

        console.log("New example started...");
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

                    console.log("Select DF Name...");
                    let buffer : Array<number> = [0xA0, 0x00, 0x00, 0x05, 0x73, 0x54, 0x52, 0x45, 0x53, 0x59 ];
                    //let buffer : Array<number> = [0xA0, 0x56, 0x96, 0x00, 0x00, 0x00, 0x01];
                    let apduResult : ApduResponse = await cardReader.sendApdu(
                        cardInfo[1],
                        {
                            Cla: 0x00,
                            Ins: 0xA4,
                            P1: 0x04,
                            P2: 0x00,
                            Le: 0x28,
                            Lc: buffer.length
                        },
                        buffer
                    );
                    console.log(`SW: ${Utilities.bytesToHexString(apduResult.SW)}\nData Received: ${Utilities.bytesToHexString(apduResult.Data)}\n`);

                    console.log("Read DF Info...")
                    //buffer  = [0x6F ,0x26 ,0x84 ,0x0A ,0xA0 ,0x00 ,0x00 ,0x05 ,0x73 ,0x54 ,0x52 ,0x45 ,0x53 ,0x59 ,0xA5 ,0x18 ,0xA6 ,0x05 ,0x56 ,0x41 ,0x41 ,0x35 ,0x30 ,0xA7 ,0x05 ,0x54 ,0x52 ,0x45 ,0x53 ,0x54 ,0xA8 ,0x01 ,0x01 ,0xA9 ,0x01 ,0x54 ,0xAA ,0x02 ,0x03 ,0x01];
                    apduResult = await cardReader.sendApdu(
                        cardInfo[1],
                        {
                            Cla: 0x00,
                            Ins: 0xC0,
                            P1: 0x00,
                            P2: 0x00,
                            Le: 0x28,
                            Lc: 0x28
                        },
                        null
                    );
                    console.log(`SW: ${Utilities.bytesToHexString(apduResult.SW)}\nData Received: ${Utilities.bytesToHexString(apduResult.Data)}\n`);

                    console.log("Read Record?..")
                    apduResult = await cardReader.sendApdu(
                        cardInfo[1],
                        {
                            Cla: 0x00,
                            Ins: 0xB2,
                            P1: 0x01,
                            P2: 0x24,
                            Le: 0x16,
                            Lc: 0
                        },
                        null
                    );
                    console.log(`SW: ${Utilities.bytesToHexString(apduResult.SW)}\nData Received: ${Utilities.bytesToHexString(apduResult.Data)}\n`);
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

            // setTimeout(() => console.log("Time elapsed!!"),15000);
            // return;

            tsPcsc.close();
            console.log("Example completed...");    
        }
        
        console.log("Reader closed");
    }
}

//Example.eventTest();
Example.main();
