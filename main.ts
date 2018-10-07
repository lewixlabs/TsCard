import  { Sle } from './memorycard';
import { MemoryCardManager } from './memorycard-manager'

let mySle = new Sle([1,2,3.4]);
console.log(mySle.cardType);

MemoryCardManager.WaitForSle();

