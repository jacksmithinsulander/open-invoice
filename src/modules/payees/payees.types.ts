export type NominatimResponse = {
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    county?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
};

export interface Address {
  houseNumber?: number;
  road?: string;
  suburb?: string;
  city?: string;
  municipality?: string;
  county?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
}

export interface Payee {
  email?: string;
  address?: Address;
  orgName?: string;
  taxNumber?: string;
}

export interface PayeeRawAddress {
  email?: string;
  rawAddress?: string;
  orgName?: string;
  taxNumber?: string;
}

export enum PayeeFields {
  Email = "email",
  OrgName = "orgName",
  TaxNumber = "taxNumber",
  HouseNumber = "address.houseNumber",
  Road = "address.road",
  Suburb = "address.suburb",
  City = "address.city",
  Municipality = "address.municipality",
  County = "address.county",
  Postcode = "address.postcode",
  Country = "address.country",
  CountryCode = "address.countryCode",
}

export interface AccountInfo {
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: Address;
  orgName?: string;
  taxNumber?: string;
  hasLogo?: boolean;
}
