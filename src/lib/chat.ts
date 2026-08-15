/**
 * Client → server chat transport. The frontend ONLY talks to our own
 * same-origin /api/chat endpoint; it never knows about Groq or any key. All
 * user-facing copy is owned by src/content/ai.ts; this helper maps raw HTTP
 * outcomes to a small set of codes the UI can render.
 */

export type AskResultCode = "rate_limit" | "invalid" | "server";

export type AskResult =
  | { ok: true; answer: string }
  | { ok: false; code: AskResultCode };

const ENDPOINT = "/api/chat";

export async function askPortfolioQuestion(question: string): Promise<AskResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch {
    return { ok: false, code: "server" };
  }

  if (!response.ok) {
    if (response.status === 429) return { ok: false, code: "rate_limit" };
    if (response.status >= 500) return { ok: false, code: "server" };
    return { ok: false, code: "invalid" };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, code: "server" };
  }

  const answer = (data as { answer?: unknown }).answer;
  if (typeof answer !== "string" || answer.trim().length === 0) {
    return { ok: false, code: "server" };
  }
  return { ok: true, answer };
}