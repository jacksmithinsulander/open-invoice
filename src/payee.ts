import { getAddressFromText } from "./ai-parse";
import { parseAddress } from "./parse-address";
import { addPayee } from "./persistence";
import { readImage } from "./read-image";
import type { Address, Payee, PayeeRawAddress } from "./types";
import { z } from "zod";

const PayeeSchema = z.object({
  email: z.string(),
  orgName: z.string(),
  taxNumber: z.string(),
  address: z.object({
    houseNumber: z.number(),
    road: z.string(),
    suburb: z.string(),
    municipality: z.string(),
    county: z.string(),
    postcode: z.number(),
    country: z.string(),
    countryCode: z.string()
  })
});

export class PayeeInstance {
  constructor(public payee: Payee) {}

  static async init(fileName: string): Promise<PayeeInstance> {
    const instance = new PayeeInstance({} as Payee);

    await instance.createPartialFromFile(fileName);

    return instance;
  }

  private async createPartialFromFile(fileName: string) {
    const text: string = await readImage(fileName);
    const payeeInfo: PayeeRawAddress = await getAddressFromText(text);
    if (payeeInfo.rawAddress) {
      const addressParsed: Address = await parseAddress(payeeInfo.rawAddress);
      this.payee = {
        email: payeeInfo.email,
        orgName: payeeInfo.orgName,
        taxNumber: payeeInfo.taxNumber,
        address: addressParsed,
      };

      await addPayee(this.payee);
    }
  }

  async export (): Promise<Payee> {
    PayeeSchema.parse(this.payee)
    return this.payee
  }

  print() {
    console.log(this.payee);
  }
}
