import ollama from "ollama";

import type { PayeeRawAddress } from "./types";

const OLLAMA_MODEL = "deepseek-coder-v2:latest";

export const getAddressFromText = async (
  rawUnparsedText: string,
): Promise<Payee> => {
  const prompt = `
Extract ONLY invoicing-related information from the text below.

Your task is to identify and return only data relevant for billing or identifying the payee (person or organization). Ignore all unrelated content completely.

Return a valid JSON object matching this exact TypeScript type:

export interface Payee {
  email?: string;
  rawAddress?: string;
  orgName?: string;
  taxNumber?: string;
}

Rules:
- Return ONLY valid JSON.
- Do not include explanations, markdown, comments, or extra text.
- If a field cannot be confidently determined, omit it entirely.
- "rawAddress" should contain the full extracted address as a single string.
- "orgName" should contain the legal or recognizable invoicing entity name.
- "taxNumber" should include VAT number, organization number, tax ID, or similar identifiers.
- Extract the most relevant invoicing entity if multiple entities appear.
- Never hallucinate or infer missing values.
- If there are street numbers that in this picture happen to have any prefix like "nr", remove that and just use the raw number as a separate word, so change for example "nr5" to "5", or "nr.5" to "5"
- If there is any spelling error that you can see based on your knowledge, please make sure to correct this

Text to analyze:
"""
${rawUnparsedText}
"""
`;
  const aiResponse = await ollama.chat({
    model: OLLAMA_MODEL,
    format: "json",
    messages: [{ role: "user", content: prompt }],
  });

  const payee: PayeeRawAddress = JSON.parse(aiResponse.message.content);

  if (payee.rawAddress) {
    payee.rawAddress = payee.rawAddress.replace(/\bnr\.?\s*(\d+)/gi, "$1");
  }

  return payee;
};
