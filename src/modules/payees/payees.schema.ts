import { Schema } from "mongoose";

import type { Address, Payee } from "./payees.types";

export const addressSchema = new Schema<Address>({
  houseNumber: Number,
  road: String,
  suburb: String,
  city: String,
  municipality: String,
  county: String,
  postcode: String,
  country: String,
  countryCode: String,
});

export const payeeSchema = new Schema<Payee>({
  email: String,
  address: addressSchema,
  orgName: String,
  taxNumber: String,
});

payeeSchema.index({ orgName: 1, taxNumber: 1 }, { unique: true });
