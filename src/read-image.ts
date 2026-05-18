import { createWorker } from "tesseract.js";

export const readImage = async (imageName: string): Promise<string> => {
  const worker = await createWorker("eng");
  const myText = await worker.recognize(imageName);
  return myText.data.text;
};
