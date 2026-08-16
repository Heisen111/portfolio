/**
 * POST /api/chat — the portfolio AI guide's ONLY endpoint.
 *
 * Vercel serverless function using the OFFICIAL Vercel Node.js Functions API
 * contract: `(req, res) => void`. Production Vercel calls the default export
 * with a Node `IncomingMessage` (plain-object `headers`, body = stream) and a
 * `ServerResponse`; any returned value is ignored. This module therefore
 * writes every response through `res` and reads the body from the request
 * stream — no web-standard `Request`/`Response` emulation, one consistent
 * contract shared with the Vite dev middleware and the tests.
 *
 * The browser only ever talks to this same-origin endpoint; the Groq API key
 * never leaves the server. Request flow:
 *
 *   method check → client IP → rate limit → body-size guard →
 *   content-type check → JSON parse → question validation →
 *   [system + user] → Groq (via injected ModelCall) → sanitized plain-text
 *   answer → JSON
 *
 * No tools, no browsing, no function calling, no databases. The model receives
 * exactly [system instructions + portfolio context] + [visitor question].
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { createModelCall, sanitizePlainText, ServerConfigError, type ModelCall } from "./groq.js";
import { buildSystemMessage, buildUserMessage } from "./prompt.js";
import { validateQuestion, isBodyOversized, MAX_BODY_BYTES } from "./validate.js";
import { rateLimiter } from "./rate-limit.js";

/** The Vercel Node.js Functions API handler signature. */
export type ChatRequestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

/**
 * Reads a request header from Node's `IncomingMessage.headers` — a plain
 * object keyed by lowercase field names whose values may be `string | string[]`
 * (arrays appear for repeated fields). Exported for the array-value unit test.
 */
export function getHeader(req: IncomingMessage, name: string): string | null {
  const value = req.headers[name.toLowerCase()];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

/** Thrown once a request body exceeds `MAX_BODY_BYTES` while streaming. */
export class BodyTooLargeError extends Error {
  constructor() {
    super("request body exceeds the maximum allowed size");
    this.name = "BodyTooLargeError";
  }
}

/**
 * Reads the request stream while enforcing the body-size limit, aborting as
 * soon as the accumulated byte count passes `MAX_BODY_BYTES` — before the
 * rest of the body is buffered. Throws `BodyTooLargeError` on overflow.
 */
export async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    total += buffer.length;
    if (total > MAX_BODY_BYTES) {
      throw new BodyTooLargeError();
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Best-effort client identity from the proxy headers Vercel sets. */
function clientIp(req: IncomingMessage): string {
  const forwarded = getHeader(req, "x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = getHeader(req, "x-real-ip");
  return real || "local";
}

function writeJson(res: ServerResponse, status: number, payload: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function createPortfolioHandler(modelCall: ModelCall): ChatRequestHandler {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      if (req.method !== "POST") {
        writeJson(res, 405, { error: "method_not_allowed" });
        return;
      }

      const ip = clientIp(req);
      if (!rateLimiter.isAllowed(ip)) {
        writeJson(res, 429, { error: "rate_limited" });
        return;
      }

      const declaredLength = Number(getHeader(req, "content-length") ?? "0");
      if (declaredLength > 0 && isBodyOversized(declaredLength)) {
        writeJson(res, 413, { error: "body_too_large" });
        return;
      }

      if (!(getHeader(req, "content-type") ?? "").includes("application/json")) {
        writeJson(res, 415, { error: "unsupported_media_type" });
        return;
      }

      // Size-check the actual body text; a header can be absent or forged.
      // readBody aborts mid-stream on overflow, so oversized chunked bodies
      // are rejected without ever being fully buffered.
      let raw: string;
      try {
        raw = await readBody(req);
      } catch (error) {
        if (error instanceof BodyTooLargeError) {
          writeJson(res, 413, { error: "body_too_large" });
          return;
        }
        writeJson(res, 400, { error: "invalid_json" });
        return;
      }

      let body: unknown;
      try {
        body = JSON.parse(raw);
      } catch {
        writeJson(res, 400, { error: "invalid_json" });
        return;
      }

      const validation = validateQuestion(body);
      if (!validation.ok) {
        writeJson(res, 400, { error: "invalid_question" });
        return;
      }

      let answer: string;
      try {
        answer = sanitizePlainText(
          await modelCall([buildSystemMessage(), buildUserMessage(validation.question)]),
        );
      } catch (error) {
        if (error instanceof ServerConfigError) {
          // Missing env config — safe, opaque failure. The real reason is
          // logged only, never returned.
          console.error(`[api/chat] server config: ${error.message}`);
          writeJson(res, 503, { error: "unconfigured" });
          return;
        }
        console.error("[api/chat] model call failed:", error);
        writeJson(res, 502, { error: "ai_unavailable" });
        return;
      }

      writeJson(res, 200, { answer });
    } catch (error) {
      console.error("[api/chat] unexpected error:", error);
      writeJson(res, 500, { error: "internal" });
    }
  };
}

const handler = createPortfolioHandler(createModelCall());

export default handler;