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
    await Bun.$`
      magick ${fileName} src/${nameWithoutExtension}.png
    `;
  } else if (extension == "pdf") {
    await Bun.$`
      magick -density 300 ${fileName} src/${nameWithoutExtension}.png
    `;
  } else {
    throw new Error("Not a valid image fileformat");
  }
  // await Bun.$`
  //   rm -rf ${fileName}
  // `;

  return `src/${nameWithoutExtension}.png`;
};

export const readAudio = async (audioName: string): Promise<string> => {
  const audioToWav = await enforceFileToWav(audioName);
  const myText = await readWav(audioToWav);
  return myText;
}

const enforceFileToWav = async (fileName: string): Promise<string> => {
  const extension = path.extname(fileName);
  console.log("Extension is ", extension);

  if (extension == "wav") {
    return fileName;
  }

  const audioFormats = [
    ".mp3",
    ".aac",
    ".flac",
    ".ogg",
    ".aif",
    ".aiff",
  ];

  const nameWithoutExtension = path.parse(fileName).name;
  if (audioFormats.includes(extension)) {
    await Bun.$`
      ffmpeg -i ${fileName} -ar 16000 -ac 1 -c:a pcm_s16le src/${nameWithoutExtension}.wav
    `;
  } else {
    throw new Error("Not a valid audio fileformat");
  }
  return `src/${nameWithoutExtension}.wav`
}

const readWav = async (fileName: string): Promise<string> => {
  return await Bun.$`whisper-cli -f ${fileName} -nt -np`.text();
}
