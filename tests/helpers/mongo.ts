import mongoose from "mongoose";

let connectedByTests = false;

function isMongooseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function isMongoAvailable(): Promise<boolean> {
  if (isMongooseConnected()) {
    return true;
  }

  try {
    const { connectDb } = await import("../../src/db/client");
    await connectDb();
    connectedByTests = true;
    return isMongooseConnected();
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
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const { payeeSchema } =
    await import("../../src/modules/payees/payees.schema");
  const model =
    (mongoose.models.Payee as typeof mongoose.Model | undefined) ??
    mongoose.model("Payee", payeeSchema);
  await model.deleteMany({});
}

export async function clearUsers(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const { userSchema } = await import("../../src/modules/users/users.schema");
  const model =
    (mongoose.models.User as typeof mongoose.Model | undefined) ??
    mongoose.model("User", userSchema);
  await model.deleteMany({});
}
