/**
 * Input validation for the public /api/chat endpoint. Every visitor message
 * is untrusted input. Requests are rejected here BEFORE anything is sent to
 * Groq. Limits are deliberately conservative for a small portfolio.
 */

/** Maximum accepted question length, measured after trimming. */
export const MAX_QUESTION_LENGTH = 1000;
/** Maximum raw request body size in bytes (JSON overhead + padding). */
export const MAX_BODY_BYTES = 2048;

export type QuestionValidation =
  | { ok: true; question: string }
  | { ok: false };

/** Validates the decoded JSON body and returns a trimmed, safe question. */
export function validateQuestion(body: unknown): QuestionValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false };
  }
  const question = (body as Record<string, unknown>).question;
  if (typeof question !== "string") return { ok: false };
  const trimmed = question.trim();
  if (trimmed.length === 0) return { ok: false };
  if (trimmed.length > MAX_QUESTION_LENGTH) return { ok: false };
  return { ok: true, question: trimmed };
}

/** Body-size guard, checked before JSON parsing. */
export function isBodyOversized(contentLength: number): boolean {
  return contentLength > MAX_BODY_BYTES;
}