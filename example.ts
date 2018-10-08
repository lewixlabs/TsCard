import { TsCard, SmartCard } from './index';

class Example {
    static async main() {

        console.log("Example started...");
        let tsPcsc = TsCard.instance;
        console.log("Waiting for reader plugged...");

        try {

            let readerName : string = await tsPcsc.detectReader(1000);
            console.log(`Reader detected:${readerName}`);

            let cardInfo : [boolean , SmartCard] = await tsPcsc.insertCard(5000);
            console.log(`Smartcard inserted:${SmartCard}`);
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
