import path from "node:path";

import { createWorker } from "tesseract.js";

export const readFile = async (fileName: string): Promise<string> => {
  const extension: string = path.extname(fileName);

  if (!extension) {
    throw new Error("File does not contain an extension I can parse");
  }
  const nameWithoutExtension = path.parse(fileName).name;

  const imageFormats = [
    ".jpg",
    ".jpeg",
    ".avif",
    ".webp",
    ".tif",
    ".tiff",
    ".gif",
    ".svg",
    ".pdf",
    ".png",
  ];

  const audioFormats = [
    ".mp3",
    ".aac",
    ".flac",
    ".ogg",
    ".aif",
    ".aiff",
    ".wav",
  ];

  if (imageFormats.includes(extension)) {
    return readImage(nameWithoutExtension, extension);
  } else if (audioFormats.includes(extension)) {
    return readAudio(nameWithoutExtension, extension);
  } else {
    throw new Error("Could not read image file type");
  }
};

const readImage = async (
  fileName: string,
  extension: string,
): Promise<string> => {
  const imageNamePng =
    extension !== ".png"
      ? await enforceFileToPng(fileName, extension)
      : fileName;

  const worker = await createWorker("eng");
  try {
    const myText = await worker.recognize(imageNamePng);
    return myText.data.text;
  } finally {
    await worker.terminate();
  }
};

const enforceFileToPng = async (
  fileName: string,
  extension: string,
): Promise<string> => {
  if (extension == ".pdf") {
    await Bun.$`
      magick -density 300 ${fileName}${extension} src/${fileName}.png
    `;
  } else {
    await Bun.$`
      magick ${fileName}${extension} src/${fileName}.png
    `;
  }
  // await Bun.$`
  //   rm -rf ${fileName}${extension}
  // `;

  return `src/${fileName}.png`;
};

const readAudio = async (
  fileName: string,
  extension: string,
): Promise<string> => {
  const audioToWav = await enforceFileToWav(fileName, extension);
  const myText = await readWav(audioToWav);
  return myText;
};

const enforceFileToWav = async (
  fileName: string,
  extension: string,
): Promise<string> => {
  await Bun.$`
    ffmpeg -i ${fileName}${extension} -ar 16000 -ac 1 -c:a pcm_s16le src/${fileName}.wav
  `;
  // await Bun.$`
  //   rm -rf ${fileName}${extension}
  // `;
  return `src/${fileName}.wav`;
};

const readWav = async (fileName: string): Promise<string> => {
  return await Bun.$`whisper-cli -f ${fileName} -nt -np`.text();
};
