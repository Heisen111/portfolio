import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createChatHandler } from "./api/chat";
import { createModelCall } from "./api/groq";

/**
 * Dev-only middleware: serves POST /api/chat in-process so `npm run dev` is
 * a full same-origin stack (Vite UI → this handler → Groq), exactly mirroring
 * how Vercel routes /api/* in production. No separate server, no CORS. In
 * production builds this plugin does nothing (configureServer is dev-only) and
 * the real function is deployed from api/chat.ts.
 *
 * Env: Vite only exposes VITE_* vars to the browser. For the dev handler we
 * load the project's real .env into this Node process (server-side only) so
 * the Groq key still never reaches the client.
 */
const handleChatRequest = createChatHandler(createModelCall());

function apiDevServer(): Plugin {
  return {
    name: "portfolio-api-dev",
    configureServer(server) {
      if (!process.env.GROQ_API_KEY) {
        const loaded = loadEnv(server.config.mode ?? "development", process.cwd(), "");
        if (loaded.GROQ_API_KEY) {
          process.env.GROQ_API_KEY = loaded.GROQ_API_KEY;
          process.env.GROQ_MODEL = loaded.GROQ_MODEL;
        }
      }

      server.middlewares.use("/api/chat", async (req, res) => {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const body = Buffer.concat(chunks).toString("utf8");
          const request = new Request(`http://localhost${req.url ?? "/api/chat"}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: body.length > 0 ? body : undefined,
          });
          const response = await handleChatRequest(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (error) {
          console.error("[api:dev] /api/chat failed:", error);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: "internal" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDevServer()],
  build: {
    target: "es2022",
  },
});