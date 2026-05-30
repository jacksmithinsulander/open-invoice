import { afterEach, describe, expect, mock, test } from "bun:test";

describe("ai-parse import guard", () => {
  afterEach(() => {
    mock.restore();
  });

  test("throws when AI_MODEL is missing at import", async () => {
    const saved = process.env.AI_MODEL;
    delete process.env.AI_MODEL;

    mock.module("dotenv", () => ({
      default: { config: mock(() => ({})) },
    }));

    await expect(
      import(`../../src/shared/utils/ai-parse?no-model=${Date.now()}`),
    ).rejects.toThrow("Could not load ollama model");

    process.env.AI_MODEL = saved ?? "test-model";
  });
});
