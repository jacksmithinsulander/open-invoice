import path from "node:path";

import { createWorker } from "tesseract.js";

export const readImage = async (imageName: string): Promise<string> => {
  const imageNamePng = await enforceFileToPng(imageName);
  const worker = await createWorker("eng");
  const myText = await worker.recognize(imageNamePng);
  return myText.data.text;
};

const enforceFileToPng = async (fileName: string): Promise<string> => {
  const extension = path.extname(fileName);
  if (extension == "png") {
    return fileName;
  }

  const imageFormats = [
    "jpg",
    "jpeg",
    "avif",
    "webp",
    "tif",
    "tiff",
    "gif",
    "svg",
  ];

  const nameWithoutExtension = path.parse(fileName).name;
  if (imageFormats.includes(extension)) {
    await Bun.$`
      magick ${fileName} ${nameWithoutExtension}.png
    `;
  } else if (extension == "pdf") {
    await Bun.$`
      magick -density 300 ${fileName} ${nameWithoutExtension}.png
    `;
  }

  return `${nameWithoutExtension}.png`;
};
