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
  private requiredFields = [
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

  getMissingFields(): string[] {
    return this.requiredFields.filter((path) => {
      const value = path
        .split(".")
        .reduce<any>((obj, key) => obj?.[key], this.payee);

      return value === undefined || value === null || value === "";
    });
  }

  private setField(path: string, value: unknown): void {
    const keys = path.split(".");
    let current: any = this.payee;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (!current[key]) {
        current[key] = {};
      }

      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  setMissingField(path: string, value: unknown): void {
    if (!this.requiredFields.includes(path)) {
      throw new Error(`Unknown required field: ${path}`);
    }

    const missingFields = this.getMissingFields();

    if (!missingFields.includes(path)) {
      throw new Error(`Field is already set: ${path}`);
    }

    this.setField(path, value);
  }

  setMissingFields(values: Record<string, unknown>): void {
    for (const [path, value] of Object.entries(values)) {
      this.setMissingField(path, value);
    }
  }
}
