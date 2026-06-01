import { z } from "zod";

import { BaseFunctions } from "../../shared/utils/organization-base";
import type { Payee, PayeeRawAddress } from "./payees.types";

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
    postcode: z.string(),
    country: z.string(),
    countryCode: z.string(),
  }),
});

export class PayeeService extends BaseFunctions<Payee> {
  requiredFields = [
    "email",
    "orgName",
    "taxNumber",
    "address.houseNumber",
    "address.road",
    "address.suburb",
    "address.municipality",
    "address.county",
    "address.postcode",
    "address.country",
    "address.countryCode",
  ];

  constructor(public payee: Payee) {
    super();
  }

  getData(): Payee {
    return this.payee;
  }

  static async init(payeeRaw: PayeeRawAddress): Promise<PayeeService> {
    const instance = new PayeeService({});

    await instance.createPartialFromRaw(payeeRaw);

    return instance;
  }

  private async createPartialFromRaw(payeeInfo: PayeeRawAddress) {
    if (payeeInfo.rawAddress) {
      const addressParsed = await this.parseAddress(payeeInfo.rawAddress);
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

  toPayeeRawAddress(): PayeeRawAddress {
    const rawAddress = [
      this.payee.address?.city,
      this.payee.address?.country,
      this.payee.address?.countryCode,
      this.payee.address?.county,
      this.payee.address?.houseNumber,
      this.payee.address?.municipality,
      this.payee.address?.postcode,
      this.payee.address?.road,
      this.payee.address?.suburb,
    ]
      .filter((value) => value !== undefined)
      .join(" ");
    return {
      email: this.payee.email,
      orgName: this.payee.orgName,
      taxNumber: this.payee.taxNumber,
      rawAddress,
    };
  }

  export(): Payee {
    PayeeSchema.parse(this.payee);
    return this.payee;
  }
}
