declare module "addressit" {
  export interface AddressItResult {
    text: string;
  }

  export default function addressit(input: string): AddressItResult;
}
