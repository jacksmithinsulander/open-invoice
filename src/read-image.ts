import { createWorker } from "tesseract.js";

export const readImage = async (): Promise<string> => {
  const worker = await createWorker("eng");
  const myText = await worker.recognize("clujaddress.png");
  return myText.data.text;
}

