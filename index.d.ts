declare interface Apdu {
  Cla : number;
  Ins : number;
  P1 : number;
  P2 : number;
  Le : number;
  Lc : number;
}

declare interface ApduResponse {
  SW : Array<number>;
  Data? : Array<number>;
}

declare enum CardEvent {
  Inserted,
  Removed
}

declare class SmartCard {

  constructor(_atr : Array<number>, _protocol: number, _isMemoryCard : boolean);

  atr : Array<number>;
  protocol : number;
  isMemoryCard : boolean;
}

declare class Reader {

  constructor(_pcscReader : any);

  name : string;

  sendApdu(card : SmartCard, cmd : Apdu, dataIn : Array<number>, timeout? : number) : Promise<ApduResponse>;
  close();
}

declare class TsCard {

  static instance : TsCard

  detectReader(timeout? : number) : Promise<Reader>;
  insertCard(timeout? : number) : Promise<[boolean,SmartCard?]>;
  removeCard(timeout? : number) : Promise<boolean>;
  onCardEvent(f : (event: CardEvent, card: SmartCard, e : Error) => void);
  close();
}