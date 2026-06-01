import { Schema } from "mongoose";

import { addressSchema } from "../../shared/types/schema";
import type { Payee } from "./payees.types";

export const payeeSchema = new Schema<Payee>({
  email: String,
  address: addressSchema,
  orgName: String,
  taxNumber: String,
});

payeeSchema.index({ orgName: 1, taxNumber: 1 }, { unique: true });
