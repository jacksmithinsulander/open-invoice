import dotenv from "dotenv";
import ollama from "ollama";

import type { Payee,PayeeRawAddress } from "./types";

dotenv.config();

const OLLAMA_MODEL = process.env.AI_MODEL;

if (!OLLAMA_MODEL) {
  throw new Error("Could not load ollama model");
}

export const createRawPayeeFromText = async (
  rawUnparsedText: string,
): Promise<PayeeRawAddress> => {
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
- "email" should contain any email address you can gather from the text
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

  const payee: PayeeRawAddress = JSON.parse(
    aiResponse.message.content,
  ) as PayeeRawAddress;

  if (payee.rawAddress) {
    payee.rawAddress = payee.rawAddress.replace(/\bnr\.?\s*(\d+)/gi, "$1");
  }

  return payee;
};

export const updatePayeeFromText = async (
  currentPayee: Payee,
  rawUnparsedText: string,
): Promise<Payee> => {
  const prompt = `
You update an existing Payee object using newly extracted invoicing information.

Return the final merged Payee as valid JSON matching this TypeScript type:

interface Payee {
  email?: string;
  rawAddress?: {
    houseNumber?: number;
    road?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    county?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
  };
  orgName?: string;
  taxNumber?: string;
}

Current Payee JSON:
${JSON.stringify(currentPayee, null, 2)}

New text to analyze:
"""
${rawUnparsedText}
"""

Instructions:
- Extract only invoicing-related information from the new text.
- Return the final merged Payee object, not a diff.
- Preserve existing fields from Current Payee unless the new text confidently provides a better or more specific value.
- Override existing fields only when the new text clearly updates that field.
- Add missing fields only when confidently found in the new text.
- Do not hallucinate missing values.
- If multiple entities appear, use the most relevant invoicing/payee entity.
- Correct obvious OCR or spelling mistakes only when the intended value is clear.
- For street numbers like "nr5", "nr.5", or "nr 5", store houseNumber as 5.
- rawAddress.houseNumber must be a number, not a string.
- Use ISO countryCode when the country is confidently known, for example "SE" for Sweden.
- Return ONLY valid JSON.
- No markdown, comments, explanations, or extra text.
`;

  const aiResponse = await ollama.chat({
    model: OLLAMA_MODEL,
    format: "json",
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(aiResponse.message.content) as Payee;
};

export const updateRawPayeeFromText = async (
  currentPayee: PayeeRawAddress,
  rawUnparsedText: string,
): Promise<PayeeRawAddress> => {
  const prompt = `
You update an existing raw Payee object using newly extracted invoicing information.

Return the final merged Payee as valid JSON matching this TypeScript type:

interface PayeeRawAddress {
  email?: string;
  rawAddress?: string;
  orgName?: string;
  taxNumber?: string;
}

Current Payee JSON:
${JSON.stringify(currentPayee, null, 2)}

New text to analyze:
"""
${rawUnparsedText}
"""

Instructions:
- Extract only invoicing-related information from the new text.
- Return the final merged PayeeRawAddress object, not a diff.
- Preserve existing fields unless the new text confidently provides a better or more complete value.
- Override existing fields only when the new text clearly updates that field.
- Add missing fields when confidently found in the new text.
- The most important field is rawAddress.
- rawAddress should be one complete address string, including as many known address parts as possible.
- If the text gives a terse or partial address, expand/normalize it as much as you can when the missing parts are confidently implied by the text or common address knowledge.
- Include street, house number, postcode, city, municipality/region, and country when confidently available or clearly implied.
- Do not invent unknown address parts.
- Do not add a country, city, postcode, or region unless you are confident.
- Normalize street numbers like "nr5", "nr.5", or "nr 5" to "5".
- Correct obvious OCR or spelling mistakes only when the intended value is clear.
- orgName should be the legal or recognizable invoicing entity name.
- taxNumber should include VAT number, organization number, tax ID, or similar identifiers.
- email should contain an email address found in the text.
- If multiple entities appear, use the most relevant invoicing/payee entity.
- Return ONLY valid JSON.
- No markdown, comments, explanations, or extra text.
`;

  const aiResponse = await ollama.chat({
    model: OLLAMA_MODEL,
    format: "json",
    messages: [{ role: "user", content: prompt }],
  });

  const payee = JSON.parse(aiResponse.message.content) as PayeeRawAddress;

  if (payee.rawAddress) {
    payee.rawAddress = payee.rawAddress.replace(/\bnr\.?\s*(\d+)/gi, "$1");
  }

  return payee;
};
