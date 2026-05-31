import { Schema } from "mongoose";

import type { Payee } from "./payees.types";
import { addressSchema } from "../../shared/types/schema";

export const payeeSchema = new Schema<Payee>({
  email: String,
  address: addressSchema,
  orgName: String,
  taxNumber: String,
});

payeeSchema.index({ orgName: 1, taxNumber: 1 }, { unique: true });
