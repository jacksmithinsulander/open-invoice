
import { Schema } from "mongoose";

import type { Address } from "node:cluster";

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

