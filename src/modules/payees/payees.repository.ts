import mongoose, { type Model } from "mongoose";

import { payeeSchema } from "./payees.schema";
import { PayeeService } from "./payees.service";
import type { Payee, PayeeFields } from "./payees.types";

export class PayeeRepository {
  private model: Model<Payee>;

  constructor() {
    this.model =
      (mongoose.models.Payee as Model<Payee> | undefined) ??
      mongoose.model<Payee>("Payee", payeeSchema);
  }

  async save(payeeService: PayeeService): Promise<PayeeService> {
    const payee: Payee = payeeService.export();
    return await this.savePayee(payee);
  }

  async savePayee(payee: Payee): Promise<PayeeService> {
    try {
      const doc = new this.model(payee);
      const saved = await doc.save();

      return new PayeeService(saved.toObject());
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

  async updatePayeeInfo(
    payeeName: string,
    field: PayeeFields,
    newValue: string | number,
  ) {
    const result = await this.model.updateOne(
      { orgName: payeeName },
      { [field]: newValue },
    );
    if (result.matchedCount && result.matchedCount && result.acknowledged) {
      return await this.getPayee(payeeName);
    } else {
      throw new Error(
        "Something went wrong when trying to update the payee info",
      );
    }
  }

  async deletePayee(payeeName: string) {
    const result = await this.model.deleteOne({ orgName: payeeName });
    if (result.deletedCount === 0) {
      throw new Error("User not found");
    }
  }

  async replacePayee(
    newPayeeObject: PayeeService,
    payeeName: string,
  ): Promise<PayeeService> {
    await this.getPayee(payeeName);
    const result = await this.model.updateOne(
      { orgName: payeeName },
      {
        $set: newPayeeObject.export(),
      },
    );
    if (
      result.matchedCount &&
      result.matchedCount &&
      result.acknowledged &&
      newPayeeObject.payee.orgName
    ) {
      return await this.getPayee(newPayeeObject.payee.orgName);
    } else {
      throw new Error(
        "Something went wrong when trying to update the payee info",
      );
    }
  }

  async getPayee(payeeName: string): Promise<PayeeService> {
    const myPayee = await this.model.findOne({ orgName: payeeName }).exec();

    if (!myPayee) {
      throw new Error(`Payee ${payeeName} not found`);
    }

    return new PayeeService(myPayee.toObject());
  }

  async getPayees(): Promise<PayeeService[]> {
    const myContacts = await this.model.find({}).exec();
    return myContacts.map((contact) => new PayeeService(contact.toObject()));
  }
}
