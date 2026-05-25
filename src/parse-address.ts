import addressit from "addressit";

import type { Address, NominatimResponse } from "./types";

const BASE_URL = "https://nominatim.openstreetmap.org/search?";

type AddressItResult = {
  text: string;
};

export const parseAddress = async (
  unparsedAddress: string,
): Promise<Address | undefined> => {
  const firstRoundParsing: AddressItResult = addressit(unparsedAddress);
  const prepareForApiCall: string = firstRoundParsing.text.replace(/ /g, "+");
  const url = new URL(BASE_URL);
  url.searchParams.set("q", prepareForApiCall);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    headers: {
      "User-Agent": "invoice-parser/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${String(response.status)}`);
  }
  const responseJson: NominatimResponse[] =
    (await response.json()) as NominatimResponse[];

  if (Object.keys(responseJson).length === 0) {
    // Remove the last word
    const shortenedAddress = unparsedAddress.split(" ").slice(0, -1).join(" ");

    // If we remove all words...
    if (!shortenedAddress) {
      // then it must be undefined
      return undefined;
    }

    // Else some good ol' recursion
    return parseAddress(shortenedAddress);
  } else {
    return decodeAddress(responseJson);
  }
};

function decodeAddress(data: NominatimResponse[]): Address | undefined {
  const addr = data[0]?.address;

  if (!addr) {
    return undefined;
  }

  return {
    houseNumber: addr.house_number ? Number(addr.house_number) : undefined,

    road: addr.road,
    suburb: addr.suburb,
    city: addr.city,
    municipality: addr.municipality,
    county: addr.county,

    postcode: addr.postcode,

    country: addr.country,

    countryCode: addr.country_code,
  };
}
