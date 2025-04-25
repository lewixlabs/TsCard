export interface Apdu {
  Cla : number;
  Ins : number;
  P1 : number;
  P2 : number;
  Le : number;
  Lc : number;
}

export interface ApduResponse {
  SW : Array<number>;
  Data? : Array<number>;
}

export enum CardEvent {
  Inserted,
  Removed
}

export enum MemoryCardTypes {
  SLE5528 = 0x05,
  SLE5542 = 0x06
}

export enum PINStatus {
  NOT_VERIFIED,
  OK,
  WRONG,
  LOCKED
}

export class SmartCard {

  constructor(_atr : Array<number>, _protocol: number, _isMemoryCard : boolean);

  atr : Array<number>;
  protocol : number;
  isMemoryCard : boolean;
}

export class Reader {

  constructor(_pcscReader : any);

  name : string;

  sendApdu(card : SmartCard, cmd : Apdu, dataIn : Array<number>, timeout? : number) : Promise<ApduResponse>;
  close();
}

export class TsCard {

  static instance : TsCard

  detectReader(timeout? : number) : Promise<Reader>;
  insertCard(timeout? : number) : Promise<[boolean,SmartCard?]>;
  removeCard(timeout? : number) : Promise<boolean>;
  onCardEvent(f : (event: CardEvent, card: SmartCard, e : Error) => void);
  close();
}