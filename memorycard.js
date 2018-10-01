const CardType  = new Map([
    ['SLE5528', 1024],
    ['SLE5542', 256],
]);

class MemoryCard {
    constructor(memoryCardAtr) {
        this.atr = atr;

        // size in bytes
        this.size = undefined;
        this.type = undefined;
        this.selector = undefined;
    }

    readBytes();
    writeBytes();
    verifyPSC(pscToVerify);
}

class Sle5542 extends MemoryCard{

    constructor(atr) {
        super(atr);

        this.size = CardType.get('SLE5542');
        this.selector = 0x06;
    }
}