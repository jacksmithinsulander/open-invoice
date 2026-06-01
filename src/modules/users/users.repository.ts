import mongoose, { type Model } from "mongoose";

import { userSchema } from "./users.schema";
import { UserService } from "./users.service";
import type { User, UserFields } from "./users.types";

export class UserRepository {
  private model: Model<User>;

  constructor() {
    this.model =
      (mongoose.models.User as Model<User> | undefined) ??
      mongoose.model<User>("User", userSchema);
  }

  async save(userService: UserService): Promise<UserService> {
    const user: User = userService.export();
    return await this.saveUser(user);
  }

  async saveUser(user: User): Promise<UserService> {
    try {
      const doc = new this.model(user);
      const saved = await doc.save();

      return new UserService(saved.toObject());
    } catch (err: unknown) {
      if (
        err instanceof mongoose.mongo.MongoServerError &&
        err.code === 11000
      ) {
        throw new Error("User already exists", { cause: err });
      }

      throw err;
    }
  }

  async updateUserInfo(
    userName: string,
    field: UserFields,
    newValue: string | number,
  ) {
    const result = await this.model.updateOne(
      { orgName: userName },
      { [field]: newValue },
    );
    if (result.matchedCount && result.matchedCount && result.acknowledged) {
      return await this.getUser(userName);
    } else {
      throw new Error(
        "Something went wrong when trying to update the user info",
      );
    }
  }

  async deleteUser(userName: string) {
    const result = await this.model.deleteOne({ orgName: userName });
    if (result.deletedCount === 0) {
      throw new Error("User not found");
    }
  }

  async replaceUser(
    newUserObject: UserService,
    userName: string,
  ): Promise<UserService> {
    await this.getUser(userName);
    const result = await this.model.updateOne(
      { orgName: userName },
      {
        $set: newUserObject.export(),
      },
    );
    if (
      result.matchedCount &&
      result.matchedCount &&
      result.acknowledged &&
      newUserObject.user.orgName
    ) {
      return await this.getUser(newUserObject.user.orgName);
    } else {
      throw new Error(
        "Something went wrong when trying to update the user info",
      );
    }
  }

  async getUser(userName: string): Promise<UserService> {
    const myUser = await this.model.findOne({ orgName: userName }).exec();

    if (!myUser) {
      throw new Error(`User ${userName} not found`);
    }

    return new UserService(myUser.toObject());
  }

  async getUsers(): Promise<UserService[]> {
    const myContacts = await this.model.find({}).exec();
    return myContacts.map((contact) => new UserService(contact.toObject()));
  }
}
