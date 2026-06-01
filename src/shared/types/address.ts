export interface Address {
  houseNumber?: number;
  road?: string;
  suburb?: string;
  city?: string;
  municipality?: string;
  county?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
}
export type NominatimResponse = {
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    county?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
};
