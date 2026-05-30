import addressit from "addressit";
import { z } from "zod";

import type { Payee, PayeeRawAddress } from "./payees.types";
import type { Address, NominatimResponse } from "./payees.types";

const BASE_URL = "https://nominatim.openstreetmap.org/search?";

type AddressItResult = {
  text: string;
};

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPathValue(source: unknown, path: string): unknown {
  let current = source;

  for (const key of path.split(".")) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

export class PayeeService {
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

  static async init(payeeRaw: PayeeRawAddress): Promise<PayeeService> {
    const instance = new PayeeService({});

    await instance.createPartialFromRaw(payeeRaw);

    return instance;
  }

  private async createPartialFromRaw(payeeInfo: PayeeRawAddress) {
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

  getMissingFields(): string[] {
    return this.requiredFields.filter((path) => {
      const value = getPathValue(this.payee, path);

      return value === undefined || value === null || value === "";
    });
  }

  private setField(path: string, value: string | number): Payee {
    const keys = path.split(".");
    const lastKey = keys[keys.length - 1];

    if (!lastKey) {
      throw new Error(`Invalid field path: ${path}`);
    }

    let current: unknown = this.payee;

    for (const key of keys.slice(0, -1)) {
      if (!isRecord(current)) {
        throw new Error(`Invalid field path: ${path}`);
      }

      const next = current[key];

      if (isRecord(next)) {
        current = next;
        continue;
      }

      const child: Record<string, unknown> = {};
      current[key] = child;
      current = child;
    }

    if (!isRecord(current)) {
      throw new Error(`Invalid field path: ${path}`);
    }

    current[lastKey] = value;

    return this.payee;
  }

  setMissingField(path: string, value: string | number): Payee {
    if (!this.requiredFields.includes(path)) {
      throw new Error(`Unknown required field: ${path}`);
    }

    const missingFields = this.getMissingFields();

    if (!missingFields.includes(path)) {
      throw new Error(`Field is already set: ${path}`);
    }

    return this.setField(path, value);
  }

  setMissingFields(values: Record<string, string | number>): void {
    for (const [path, value] of Object.entries(values)) {
      this.setMissingField(path, value);
    }
  }
}

const parseAddress = async (
  unparsedAddress: string,
): Promise<Address | undefined> => {
  const firstRoundParsing: AddressItResult = addressit(unparsedAddress);
  const prepareForApiCall: string = firstRoundParsing.text.replace(/ /g, "+");
  const url = new URL(BASE_URL);
  url.searchParams.set("q", prepareForApiCall);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    headers: {
      "User-Agent": "invoice-parser/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${String(response.status)}`);
  }
  const responseJson: NominatimResponse[] =
    (await response.json()) as NominatimResponse[];

  if (Object.keys(responseJson).length === 0) {
    // Remove the last word
    const shortenedAddress = unparsedAddress.split(" ").slice(0, -1).join(" ");

    // If we remove all words...
    if (!shortenedAddress) {
      // then it must be undefined
      return undefined;
    }

    // Else some good ol' recursion
    return parseAddress(shortenedAddress);
  } else {
    return decodeAddress(responseJson);
  }
};

function decodeAddress(data: NominatimResponse[]): Address | undefined {
  const addr = data[0]?.address;

  if (!addr) {
    return undefined;
  }

  return {
    houseNumber: addr.house_number ? Number(addr.house_number) : undefined,

    road: addr.road,
    suburb: addr.suburb,
    city: addr.city,
    municipality: addr.municipality,
    county: addr.county,

    postcode: addr.postcode,

    country: addr.country,

    countryCode: addr.country_code,
  };
}
