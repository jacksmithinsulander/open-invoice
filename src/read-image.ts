import path from "node:path";

import { createWorker } from "tesseract.js";

export const readImage = async (imageName: string): Promise<string> => {
  const imageNamePng = await enforceFileToPng(imageName);
  console.log("Png enforced name is: ", imageNamePng);
  const worker = await createWorker("eng");
  const myText = await worker.recognize(imageNamePng);
  return myText.data.text;
};

const enforceFileToPng = async (fileName: string): Promise<string> => {
  const extension = path.extname(fileName);
  console.log("Extension is ", extension);

  if (extension == "png") {
    return fileName;
  }

  const imageFormats = [
    ".jpg",
    ".jpeg",
    ".avif",
    ".webp",
    ".tif",
    ".tiff",
    ".gif",
    ".svg",
  ];

  const nameWithoutExtension = path.parse(fileName).name;
  if (imageFormats.includes(extension)) {
    console.log("Correct hit");
    await Bun.$`
      magick ${fileName} src/${nameWithoutExtension}.png
    `;
  } else if (extension == "pdf") {
    await Bun.$`
      magick -density 300 ${fileName} src/${nameWithoutExtension}.png
    `;
  } else {
    throw new Error("Not a valid fileformat");
  }
  await Bun.$`
    rm -rf ${fileName}
  `;

  return `src/${nameWithoutExtension}.png`;
};
