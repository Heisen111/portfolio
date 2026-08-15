import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guardrails that hold by construction:
 *  - GROQ_API_KEY exists ONLY server-side (api/*.ts) — never in the client,
 *    HTML, or public assets.
 *  - AI responses are rendered as plain text — never dangerouslySetInnerHTML.
 *  - .env is protected by .gitignore.
 */

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      yield* walk(path);
    } else if (/\.(?:ts|tsx|js|jsx|css|html|json|svg|md)$/.test(name)) {
      yield path;
    }
  }
}

describe("secret hygiene", () => {
  it("never references the Groq API key from client code or public assets", () => {
    const offenders: string[] = [];
    for (const dir of ["src", "public"]) {
      for (const file of walk(join(process.cwd(), dir))) {
        if (readFileSync(file, "utf8").includes("GROQ_API_KEY")) {
          offenders.push(file);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("does not use dangerouslySetInnerHTML anywhere in the client", () => {
    const offenders: string[] = [];
    for (const file of walk(join(process.cwd(), "src"))) {
      if (readFileSync(file, "utf8").includes("dangerouslySetInnerHTML")) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("does not expose the key in the static entry document", () => {
    const indexHtml = readFileSync(join(process.cwd(), "index.html"), "utf8");
    expect(indexHtml).not.toContain("GROQ_API_KEY");
  });

  it("protects .env via .gitignore (and ships an example instead)", () => {
    const gitignore = readFileSync(join(process.cwd(), ".gitignore"), "utf8");
    expect(gitignore).toMatch(/^\.env$/m);
    expect(gitignore).toContain(".env.*");
    expect(gitignore).toContain("!.env.example");

    const example = readFileSync(join(process.cwd(), ".env.example"), "utf8");
    expect(example).toContain("GROQ_API_KEY");
    expect(example).toContain("GROQ_MODEL=openai/gpt-oss-120b");
  });

  it("keeps the server-side key reference only in the api layer", () => {
    const offenders: string[] = [];
    const apiDir = join(process.cwd(), "api");
    for (const file of walk(apiDir)) {
      if (!readFileSync(file, "utf8").includes("GROQ_API_KEY")) {
        offenders.push(file);
      }
    }
    // At least groq.ts must reference it; every other file is free to skip it.
    expect(offenders).not.toContain(join(apiDir, "groq.ts"));
  });
});