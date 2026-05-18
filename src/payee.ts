import { z } from "zod";

import { getAddressFromText } from "./ai-parse";
import { parseAddress } from "./parse-address";
import { readImage } from "./read-image";
import type { Payee, PayeeRawAddress } from "./types";

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
    countryCode: z.string(),
  }),
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
    console.log(payeeInfo.rawAddress);
    if (payeeInfo.rawAddress) {
      const addressParsed = await parseAddress(payeeInfo.rawAddress);
      if (!addressParsed) {
        throw Error("Could not parse address");
      }

      this.payee = {
        email: payeeInfo.email,
        orgName: payeeInfo.orgName,
        taxNumber: payeeInfo.taxNumber,
        address: addressParsed,
      };
    }
  }

  export(): Payee {
    PayeeSchema.parse(this.payee);
    return this.payee;
  }

  print() {
    console.log(this.payee);
  }
}
