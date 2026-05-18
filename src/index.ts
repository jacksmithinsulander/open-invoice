import { PayeeInstance } from "./payee";

const payee: PayeeInstance = await PayeeInstance.init("src/clujaddress.png");
payee.print();
console.log("Export result is", payee.export());
