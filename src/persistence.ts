import mongoose, { type Model, Schema } from "mongoose";

import { PayeeInstance } from "./payee";
import type { Address, Payee } from "./types";

const addressSchema = new Schema<Address>({
  houseNumber: Number,
  road: String,
  suburb: String,
  city: String,
  municipality: String,
  county: String,
  postcode: Number,
  country: String,
  countryCode: String,
});

const payeeSchema = new Schema<Payee>({
  email: String,
  address: addressSchema,
  orgName: String,
  taxNumber: String,
});

payeeSchema.index({ orgName: 1, taxNumber: 1 }, { unique: true });

export class PayeeRepository {
  private model: Model<Payee>;

  constructor() {
    this.model =
      (mongoose.models.Payee as Model<Payee> | undefined) ??
      mongoose.model<Payee>("Payee", payeeSchema);
  }

  async connect() {
    if (
      mongoose.connection.readyState === mongoose.ConnectionStates.disconnected
    ) {
      await mongoose.connect("mongodb://127.0.0.1:27017/test");
    }
  }

  async save(payee: PayeeInstance): Promise<PayeeInstance> {
    await this.connect();
    try {
      const doc = new this.model(payee.export());
      const saved = await doc.save();

      return new PayeeInstance(saved.toObject());
    } catch (err: unknown) {
      if (
        err instanceof mongoose.mongo.MongoServerError &&
        err.code === 11000
      ) {
        throw new Error("Payee already exists", { cause: err });
      }

      throw err;
    }
  }
}
