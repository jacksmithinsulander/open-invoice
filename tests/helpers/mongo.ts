import mongoose from "mongoose";

let connectedByTests = false;

export async function isMongoAvailable(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const { connectDb } = await import("../../src/db/client");
    await connectDb();
    connectedByTests = true;
    return mongoose.connection.readyState === 1;
  } catch (error) {
    console.warn(
      "MongoDB unavailable — DB tests skipped. Run inside nix-shell:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

export async function connectTestMongo(): Promise<void> {
  const available = await isMongoAvailable();
  if (!available) {
    throw new Error(
      "MongoDB is not reachable. Run tests inside nix-shell (mongodb must be running).",
    );
  }
}

export async function disconnectTestMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectedByTests = false;
  }
}

export async function clearPayees(): Promise<void> {
  const model = mongoose.models.Payee;
  if (model) {
    await model.deleteMany({});
  }
}

export function wasConnectedByTests(): boolean {
  return connectedByTests;
}
