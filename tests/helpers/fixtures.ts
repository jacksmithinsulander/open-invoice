import { join } from "node:path";

import type {
  Payee,
  PayeeRawAddress,
} from "../../src/modules/payees/payees.types";
import type { NominatimResponse } from "../../src/modules/payees/payees.types";
import type { User, UserRawAddress } from "../../src/modules/users/users.types";

export const completePayee: Payee = {
  email: "billing@acme.example",
  orgName: "Acme Corp",
  taxNumber: "RO12345678",
  address: {
    houseNumber: 5,
    road: "Main Street",
    suburb: "Centru",
    city: "Cluj-Napoca",
    municipality: "Cluj-Napoca",
    county: "Cluj",
    postcode: "400001",
    country: "Romania",
    countryCode: "ro",
  },
};

export const completePayeeRaw: PayeeRawAddress = {
  email: "billing@acme.example",
  orgName: "Acme Corp",
  taxNumber: "RO12345678",
  rawAddress: "5 Main Street, Cluj-Napoca, Romania",
};

export const completeUser: User = {
  name: "Jane Doe",
  email: "jane@acme.example",
  phoneNumber: "+40123456789",
  orgName: "Acme User Corp",
  taxNumber: "RO87654321",
  registrationNumber: "J40/123/2020",
  hasLogo: true,
  address: {
    houseNumber: 5,
    road: "Main Street",
    suburb: "Centru",
    city: "Cluj-Napoca",
    municipality: "Cluj-Napoca",
    county: "Cluj",
    postcode: "400001",
    country: "Romania",
    countryCode: "ro",
  },
};

export const completeUserRaw: UserRawAddress = {
  name: "Jane Doe",
  email: "jane@acme.example",
  phoneNumber: "+40123456789",
  orgName: "Acme User Corp",
  taxNumber: "RO87654321",
  registrationNumber: "J40/123/2020",
  hasLogo: true,
  rawAddress: "5 Main Street, Cluj-Napoca, Romania",
};

export const nominatimResponse: NominatimResponse[] = [
  {
    address: {
      house_number: "5",
      road: "Main Street",
      suburb: "Centru",
      city: "Cluj-Napoca",
      municipality: "Cluj-Napoca",
      county: "Cluj",
      postcode: "400001",
      country: "Romania",
      country_code: "ro",
    },
  },
];

export const emptyNominatimResponse: NominatimResponse[] = [];

export const nominatimResponseNoAddress: NominatimResponse[] = [{}];

export const ocrText =
  "Acme Corp\n5 Main Street\nCluj-Napoca\nRomania\nbilling@acme.example\nRO12345678";

export const projectRoot = join(import.meta.dir, "../..");

export const testAssetsDir = join(projectRoot, "test-assets");
