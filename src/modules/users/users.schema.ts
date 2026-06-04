import { Schema } from "mongoose";

import { addressSchema } from "../../shared/types/schema";
import type { User } from "./users.types";

export const userSchema = new Schema<User>({
  name: String,
  email: String,
  phoneNumber: String,
  address: addressSchema,
  orgName: String,
  taxNumber: String,
  registrationNumber: String,
  hasLogo: Boolean,
  baseCurrency: String,
});

userSchema.index({ orgName: 1, taxNumber: 1 }, { unique: true });
