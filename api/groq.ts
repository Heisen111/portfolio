import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

/** A single message passed to the model. Only system/user are ever used. */
export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

/** The model call is the only place the AI backend hangs off the handler. */
export type ModelCall = (messages: ChatMessage[]) => Promise<string>;

/** Raised when a required server environment variable is missing. */
export class ServerConfigError extends Error {}

/** Server-controlled generation limits (never client-tunable). */
const OUTPUT_MAX_TOKENS = 240;
const TEMPERATURE = 0.4;

/**
 * Official Groq SDK backed model call. The client is created lazily on the
 * FIRST request and only after both required env vars have been validated, so
 * a misconfiguration fails with a clean ServerConfigError instead of a cryptic
 * SDK error, and no key is ever touched on import.
 *
 * Env is read per request (never at import time) so tests can set/clear it.
 */
export function createModelCall(): ModelCall {
  let client: Groq | null = null;

  return async (messages: ChatMessage[]): Promise<string> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new ServerConfigError("GROQ_API_KEY is not configured");
    }
    const model = process.env.GROQ_MODEL;
    if (!model) {
      throw new ServerConfigError("GROQ_MODEL is not configured");
    }
    client ??= new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model,
      messages: messages as ChatCompletionMessageParam[],
      max_tokens: OUTPUT_MAX_TOKENS,
      temperature: TEMPERATURE,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const cleaned = sanitizePlainText(content);
    if (cleaned.length === 0) {
      throw new Error("Groq returned an empty completion");
    }
    return cleaned;
  };
}

/**
 * Output validation: treat model output as untrusted. The result is always
 * plain text; nothing else is ever returned to the client. Length is clamped
 * to a conservative ceiling so a runaway generation cannot bloat the payload.
 * Applied by the model call AND again at the handler boundary (idempotent).
 */
export const OUTPUT_MAX_CHARS = 1600;

export function sanitizePlainText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length <= OUTPUT_MAX_CHARS) return trimmed;
  return `${trimmed.slice(0, OUTPUT_MAX_CHARS).replace(/\s+\S*$/, "")}…`;
}