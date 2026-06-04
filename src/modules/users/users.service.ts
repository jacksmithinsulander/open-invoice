import { z } from "zod";

import { BaseFunctions } from "../../shared/utils/organization-base";
import type { User, UserRawAddress } from "./users.types";

const UserSchema = z.object({
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  orgName: z.string(),
  taxNumber: z.string(),
  registrationNumber: z.string(),
  hasLogo: z.boolean(),
  address: z.object({
    houseNumber: z.number(),
    road: z.string(),
    suburb: z.string(),
    municipality: z.string(),
    county: z.string(),
    postcode: z.string(),
    country: z.string(),
    countryCode: z.string(),
  }),
});

export class UserService extends BaseFunctions<User> {
  requiredFields = [
    "name",
    "email",
    "phoneNumber",
    "orgName",
    "taxNumber",
    "registrationNumber",
    "hasLogo",
    "address.houseNumber",
    "address.road",
    "address.suburb",
    "address.municipality",
    "address.county",
    "address.postcode",
    "address.country",
    "address.countryCode",
  ];

  constructor(public user: User) {
    super();
  }

  getData(): User {
    return this.user;
  }

  static async init(userRaw: UserRawAddress): Promise<UserService> {
    const instance = new UserService({});

    await instance.createPartialFromRaw(userRaw);

    return instance;
  }

  private async createPartialFromRaw(userInfo: UserRawAddress) {
    if (userInfo.rawAddress) {
      const addressParsed = await this.parseAddress(userInfo.rawAddress);
      if (!addressParsed) {
        throw Error("Could not parse address");
      }

      this.user = {
        name: userInfo.name,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
        orgName: userInfo.orgName,
        taxNumber: userInfo.taxNumber,
        registrationNumber: userInfo.registrationNumber,
        hasLogo: userInfo.hasLogo,
        baseCurrency: userInfo.baseCurrency?.toUpperCase(),
        address: addressParsed,
      };
    }
  }

  toUserRawAddress(): UserRawAddress {
    const rawAddress = [
      this.user.address?.city,
      this.user.address?.country,
      this.user.address?.countryCode,
      this.user.address?.county,
      this.user.address?.houseNumber,
      this.user.address?.municipality,
      this.user.address?.postcode,
      this.user.address?.road,
      this.user.address?.suburb,
    ]
      .filter((value) => value !== undefined)
      .join(" ");
    return {
      name: this.user.name,
      email: this.user.email,
      phoneNumber: this.user.phoneNumber,
      orgName: this.user.orgName,
      taxNumber: this.user.taxNumber,
      registrationNumber: this.user.registrationNumber,
      hasLogo: this.user.hasLogo,
      baseCurrency: this.user.baseCurrency,
      rawAddress,
    };
  }

  export(): User {
    if (this.user.baseCurrency) {
      this.user.baseCurrency = this.user.baseCurrency.toUpperCase();
    }
    UserSchema.parse(this.user);
    return this.user;
  }
}
