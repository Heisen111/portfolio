import { describe, expect, it } from "vitest";
import {
  MAX_QUESTION_LENGTH,
  validateQuestion,
  isBodyOversized,
} from "../api/validate";

describe("validateQuestion", () => {
  it("accepts a normal, trimmed question", () => {
    const result = validateQuestion({ question: "  What is Loupe?  " });
    expect(result).toEqual({ ok: true, question: "What is Loupe?" });
  });

  it("accepts a question of exactly the maximum length", () => {
    const question = "a".repeat(MAX_QUESTION_LENGTH);
    expect(validateQuestion({ question })).toEqual({ ok: true, question });
  });

  it("rejects an empty question", () => {
    expect(validateQuestion({ question: "" }).ok).toBe(false);
  });

  it("rejects a whitespace-only question", () => {
    expect(validateQuestion({ question: "   \n\t " }).ok).toBe(false);
  });

  it("rejects an oversized question", () => {
    expect(validateQuestion({ question: "a".repeat(MAX_QUESTION_LENGTH + 1) }).ok).toBe(
      false,
    );
  });

  it("rejects a missing question field", () => {
    expect(validateQuestion({}).ok).toBe(false);
  });

  it("rejects a non-string question", () => {
    expect(validateQuestion({ question: 42 }).ok).toBe(false);
    expect(validateQuestion({ question: ["What is Loupe?"] }).ok).toBe(false);
  });

  it("rejects non-object bodies", () => {
    expect(validateQuestion(null).ok).toBe(false);
    expect(validateQuestion("What is Loupe?").ok).toBe(false);
    expect(validateQuestion(["What is Loupe?"]).ok).toBe(false);
    expect(validateQuestion(undefined).ok).toBe(false);
  });

  it("ignores unexpected extra fields", () => {
    const result = validateQuestion({
      question: "What is Loupe?",
      model: "oops-not-client-controlled",
      temperature: 99,
    });
    expect(result).toEqual({ ok: true, question: "What is Loupe?" });
  });
});

describe("isBodyOversized", () => {
  it("allows normal bodies", () => {
    expect(isBodyOversized(250)).toBe(false);
  });

  it("rejects oversized bodies", () => {
    expect(isBodyOversized(10_000_000)).toBe(true);
  });
});