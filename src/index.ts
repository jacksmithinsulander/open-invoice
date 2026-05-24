import { PayeeRepository } from "./persistence";

// const payee: PayeeInstance = await PayeeInstance.init("src/clujaddress.jpg");
// payee.print();
// console.log("Export result is", payee.export());
const payeeDb = new PayeeRepository();
// await payeeDb.save(payee);
const searchRes = await payeeDb.getContact("Asociatia ETHCLUJ");
console.log("Search res single: ", searchRes);
const searchResMulti = await payeeDb.getContacts();
console.log("Search res multi: ", searchResMulti);
