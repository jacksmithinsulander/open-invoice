import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getMongoUri(): string {
  const app = getRequiredEnv("MONGO_APP");

  return `mongodb://${getRequiredEnv("MONGO_USER")}:${getRequiredEnv("MONGO_PASS")}@${getRequiredEnv("MONGO_PORT")}/${app}?authSource=${app}`;
}

export async function connectDb() {
  await mongoose.connect(getMongoUri());
}

export { mongoose };
