import { TsCard, SmartCard } from './index';

class Example {
    static async main() {

        console.log("Example started...");
        let tsPcsc = TsCard.instance;
        console.log("Waiting for reader plugged...");

        try {

            let readerName : string = await tsPcsc.detectReader(15000);
            if (readerName != null && readerName.length > 0) {

                console.log(`Reader detected:${readerName}`);

                let cardInfo : [boolean , SmartCard?] = await tsPcsc.insertCard(15000);
                if (cardInfo[0])
                    console.log(`Smartcard inserted:${cardInfo["0"]}\nSmartCard: ${cardInfo["1"]}`);
                else
                    console.log(`Smartcard inserted:${cardInfo["0"]}`);
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
