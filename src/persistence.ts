import dotenv from "dotenv";
import mongoose, { type Model, Schema } from "mongoose";

import { PayeeInstance } from "./payee";
import type { Address, Payee } from "./types";

dotenv.config();

const MONGO_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_PORT}/${process.env.MONGO_APP}?authSource=${process.env.MONGO_APP}`;

console.log("Mongo uri:", MONGO_URI);

const addressSchema = new Schema<Address>({
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
      await mongoose.connect(MONGO_URI);
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

  async getContact(contactName: string): Promise<PayeeInstance | null> {
    await this.connect();
    try {
      const myContact = await this.model
        .findOne({ orgName: contactName })
        .exec();
      return myContact ? new PayeeInstance(myContact.toObject()) : null;
    } catch (err: unknown) {
      throw err;
    }
  }

  async getContacts(): Promise<PayeeInstance[]> {
    await this.connect();

    try {
      const myContacts = await this.model.find({}).exec();
      return myContacts.map((contact) => new PayeeInstance(contact.toObject()));
    } catch (err: unknown) {
      throw err;
    }
  }
}
