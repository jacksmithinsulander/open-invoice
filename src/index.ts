// import { getAddressFromText } from "./ai-parse";
// import { parseAddress } from "./parse-address";
// import { addPayee } from "./persistence";
// import { readImage } from "./read-image";
// import type { Address,Payee, PayeeRawAddress } from "./types";

// const text: string = await readImage("src/clujaddress.png");
// const payeeInfo: PayeeRawAddress = await getAddressFromText(text);
// if (payeeInfo.rawAddress) {
//   const addressParsed: Address = await parseAddress(payeeInfo.rawAddress);
//   const payee: Payee = {
//     email: payeeInfo.email,
//     orgName: payeeInfo.orgName,
//     taxNumber: payeeInfo.taxNumber,
//     address: addressParsed,
//   };

//   await addPayee(payee);
// }

import { PayeeInstance } from "./payee";

const payee: PayeeInstance = await PayeeInstance.init("src/clujaddress.png");
payee.print();
