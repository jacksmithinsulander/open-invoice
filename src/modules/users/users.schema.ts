import { addressSchema } from "../../shared/types/schema";
import { User } from "./users.types";
import { Schema } from "mongoose";


export const userSchema = new Schema<User>({
  name: String,
  email: String,
  phoneNumber: String,
  address: addressSchema,
  orgName: String,
  taxNumber: String,
  registrationNumber: String,
  hasLogo: Boolean,
});


userSchema.index({ orgName: 1, taxNumber: 1 }, { unique: true });
