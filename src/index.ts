import { readImage } from "./read-image"
import { getAddressFromText } from "./ai-parse"
import { Payee, PayeeRawAddress, Address } from "./types"
import { parseAddress } from "./parse-address"
import { addPayee } from "./persistence"

const text: string = await readImage();
const payeeInfo: PayeeRawAddress = await getAddressFromText(text);
if (payeeInfo.rawAddress) {
  const addressParsed: Address = await parseAddress(payeeInfo.rawAddress);
  const payee: Payee = {
    email: payeeInfo.email,
    orgName: payeeInfo.orgName,
    taxNumber: payeeInfo.taxNumber,
    address: addressParsed
  }

  await addPayee(payee);
}
