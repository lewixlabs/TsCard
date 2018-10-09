import { TsCard } from './index';
import Reader, { ApduResponse } from './reader';
import SmartCard from './smartcard';

class Example {
    static async main() {

        console.log("Example started...");
        let tsPcsc = TsCard.instance;
        console.log("Waiting for reader plugged...");

        try {

            let cardReader : Reader = await tsPcsc.detectReader(15000);
            if (cardReader != null) {

                console.log(`Reader detected:${cardReader.name}`);

                let cardInfo : [boolean , SmartCard?] = await tsPcsc.insertCard(15000);
                if (cardInfo[0])
                    console.log(`Smartcard inserted:${cardInfo["0"]}\nSmartCard ATR: ${cardInfo["1"].atr}`);
                else
                    console.log(`Smartcard inserted:${cardInfo["0"]}`);

                console.log("Read MasterFile DF...");
                let apduResult : ApduResponse = await cardReader.sendApdu(
                    cardInfo[1],
                    {
                        Cla: 0x00,
                        Ins: 0xA4,
                        P1: 0x00,
                        P2: 0x00,
                        Le: 80
                    },
                    [ 0x99, 0x99]
                );
                console.log(`SW: ${apduResult.SW}\nData Received: ${apduResult.Data}`);
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

Example.main();
