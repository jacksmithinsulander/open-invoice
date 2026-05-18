import { PayeeInstance } from "./payee";
import { PayeeRepository } from "./persistence";

const payee: PayeeInstance = await PayeeInstance.init("src/clujaddress.jpg");
payee.print();
console.log("Export result is", payee.export());
const payeeDb = new PayeeRepository();
await payeeDb.save(payee);
