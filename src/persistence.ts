import mongoose, { Schema } from "mongoose";

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

export const addPayee = async (payee: Payee) => {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
  const Payee = mongoose.model("Payee", payeeSchema);

  const payeeInstance = new Payee(payee);
  await payeeInstance.save();
  const payees = await Payee.find();
  console.log(payees);
};
