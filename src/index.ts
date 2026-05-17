import { readImage } from "./read-image"
import { getAddressFromText } from "./ai-parse"
import { Payee } from "./types"
import { parseAddress } from "./parse-address"

const text: string = await readImage();
const payeeInfo: Payee = await getAddressFromText(text);
{ payeeInfo.rawAddress && console.log(await parseAddress(payeeInfo.rawAddress))}

// const server = Bun.serve({
//   routes: {
//     "/api/status": new Response("Ok")
//   },
// });

// console.log(`Server running at ${server.url}`);
