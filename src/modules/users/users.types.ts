import { type Address } from "../../shared/types/address";

export interface AccountInfo {
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: Address;
  orgName?: string;
  taxNumber?: string;
  registrationNumber?: string;
  hasLogo?: boolean;
}
