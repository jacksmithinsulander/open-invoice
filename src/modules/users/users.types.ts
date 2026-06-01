import { type Address } from "../../shared/types/address";

export interface User {
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: Address;
  orgName?: string;
  taxNumber?: string;
  registrationNumber?: string;
  hasLogo?: boolean;
}

export interface UserRawAddress {
  name?: string;
  email?: string;
  phoneNumber?: string;
  rawAddress?: string;
  orgName?: string;
  taxNumber?: string;
  registrationNumber?: string;
  hasLogo?: boolean;
}

export enum UserFields {
  Name = "name",
  Email = "email",
  PhoneNumber = "phoneNumber",
  OrgName = "orgName",
  TaxNumber = "taxNumber",
  RegistrationNumber = "registrationNumber",
  HasLogo = "hasLogo",
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
