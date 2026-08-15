/**
 * POST /api/chat — the portfolio AI guide's ONLY endpoint.
 *
 * Vercel serverless function (Node runtime, web-standard Request/Response).
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
import { createModelCall, sanitizePlainText, ServerConfigError, type ModelCall } from "./groq";
import { buildSystemMessage, buildUserMessage } from "./prompt";
import { validateQuestion, isBodyOversized } from "./validate";
import { rateLimiter } from "./rate-limit";

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

/** Best-effort client identity from the proxy headers Vercel sets. */
function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  return real || "local";
}

export function createChatHandler(modelCall: ModelCall): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    try {
      if (req.method !== "POST") {
        return json(405, { error: "method_not_allowed" });
      }

      const ip = clientIp(req);
      if (!rateLimiter.isAllowed(ip)) {
        return json(429, { error: "rate_limited" });
      }

      const declaredLength = Number(req.headers.get("content-length") ?? "0");
      if (declaredLength > 0 && isBodyOversized(declaredLength)) {
        return json(413, { error: "body_too_large" });
      }

      if (!(req.headers.get("content-type") ?? "").includes("application/json")) {
        return json(415, { error: "unsupported_media_type" });
      }

      // Size-check the actual body text; a header can be absent or forged
      // (in-memory Request objects don't even expose content-length).
      let raw: string;
      try {
        raw = await req.text();
      } catch {
        return json(400, { error: "invalid_json" });
      }
      if (isBodyOversized(Buffer.byteLength(raw, "utf8"))) {
        return json(413, { error: "body_too_large" });
      }

      let body: unknown;
      try {
        body = JSON.parse(raw);
      } catch {
        return json(400, { error: "invalid_json" });
      }

      const validation = validateQuestion(body);
      if (!validation.ok) {
        return json(400, { error: "invalid_question" });
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
          return json(503, { error: "unconfigured" });
        }
        console.error("[api/chat] model call failed:", error);
        return json(502, { error: "ai_unavailable" });
      }

      return json(200, { answer });
    } catch (error) {
      console.error("[api/chat] unexpected error:", error);
      return json(500, { error: "internal" });
    }
  };
}

const handler = createChatHandler(createModelCall());

export default handler;