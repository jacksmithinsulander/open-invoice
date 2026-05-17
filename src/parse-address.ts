import addressit from "addressit";

const BASE_URL = "https://nominatim.openstreetmap.org/search?"

export const parseAddress = async (unparsedAddress: string): Promise<any> => {
  const firstRoundParsing = addressit(unparsedAddress);
  const prepareForApiCall: string = firstRoundParsing.text.replace(/ /g, "+");
  //const url = `${BASE_URL}q=${prepareForApiCall}`;
  const url = new URL(BASE_URL);
  url.searchParams.set("q", prepareForApiCall);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    headers: {
      "User-Agent": "invoice-parser/1.0",
      "Accept": "application/json",
     },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const responseJson = await response.json();
  if (Object.keys(responseJson).length === 0 ) {
    return parseAddress(unparsedAddress.split(" ").slice(0, -1).join(" "))
  } else {
    return responseJson;
  }
}
