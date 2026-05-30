import { mock, spyOn } from "bun:test";
import ollama from "ollama";
import * as tesseract from "tesseract.js";

import {
  audioTranscript,
  completePayee,
  completePayeeRaw,
  nominatimResponse,
  ocrText,
} from "./fixtures";

type ChatResponse = {
  message: { content: string };
};

function chatHandler(
  handler?: (prompt: string) => ChatResponse,
  replaceFullAddress?: boolean,
) {
  return mock((options: { messages: { content: string }[] }) => {
    const prompt = options.messages[0]?.content ?? "";
    if (handler) {
      return handler(prompt);
    }

    if (prompt.includes("replaceFullAddress")) {
      return {
        message: {
          content: JSON.stringify({
            replaceFullAddress: replaceFullAddress ?? false,
          }),
        },
      };
    }

    if (prompt.includes("PayeeRawAddress")) {
      return {
        message: {
          content: JSON.stringify({
            ...completePayeeRaw,
            rawAddress:
              replaceFullAddress === true
                ? "10 New Street, Bucharest, Romania"
                : "nr.5 Main Street, Cluj-Napoca, Romania",
          }),
        },
      };
    }

    if (prompt.includes("Current Payee JSON")) {
      return {
        message: {
          content: JSON.stringify({
            ...completePayee,
            email: "new@acme.example",
          }),
        },
      };
    }

    if (replaceFullAddress !== undefined) {
      return {
        message: {
          content: JSON.stringify({
            ...completePayee,
            email: "patched@acme.example",
          }),
        },
      };
    }

    return {
      message: { content: JSON.stringify(completePayeeRaw) },
    };
  });
}

export function mockOllama(handler?: (prompt: string) => ChatResponse): void {
  spyOn(ollama, "chat").mockImplementation(
    chatHandler(handler) as typeof ollama.chat,
  );
}

export function mockOllamaReplaceFullAddress(replace: boolean): void {
  spyOn(ollama, "chat").mockImplementation(
    mock((options: { messages: { content: string }[] }) => {
      const prompt = options.messages[0]?.content ?? "";

      if (prompt.includes("replaceFullAddress")) {
        return {
          message: {
            content: JSON.stringify({ replaceFullAddress: replace }),
          },
        };
      }

      if (prompt.includes("PayeeRawAddress")) {
        return {
          message: {
            content: JSON.stringify({
              ...completePayeeRaw,
              rawAddress: "10 New Street, Bucharest, Romania",
            }),
          },
        };
      }

      return {
        message: {
          content: JSON.stringify({
            ...completePayee,
            email: "patched@acme.example",
          }),
        },
      };
    }) as typeof ollama.chat,
  );
}

export function mockTesseract(text = ocrText): void {
  spyOn(tesseract, "createWorker").mockImplementation(
    mock(async () => ({
      recognize: mock(async () => ({ data: { text } })),
      terminate: mock(async () => undefined),
    })) as typeof tesseract.createWorker,
  );
}

export function mockShellCommands(): void {
  const shellMock = mock(async () => ({
    text: async () => audioTranscript,
  }));

  Object.defineProperty(globalThis, "Bun", {
    value: {
      ...Bun,
      $: shellMock,
    },
    configurable: true,
  });
}

export function mockFetchNominatim(
  responses: unknown[] = nominatimResponse,
  ok = true,
): void {
  const realFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = mock(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.includes("nominatim.openstreetmap.org")) {
        return {
          ok,
          status: ok ? 200 : 500,
          json: async () => responses,
        } as Response;
      }

      return realFetch(input, init);
    },
  ) as typeof fetch;
}

export function restoreFetch(): void {
  globalThis.fetch = fetch;
}
