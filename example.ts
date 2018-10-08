import { TsPcscLite } from './index';

class Example {
    static async main() {

        console.log("Example started...");
        let tsPcsc = TsPcscLite.instance;
        console.log("Waiting for reader plugged...");

        try {

            let readerName : string = await tsPcsc.detectReader();
            console.log(`Reader detected:${readerName}`);
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
