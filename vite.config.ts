import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createPortfolioHandler } from "./api/chat";
import { createModelCall } from "./api/groq";

/**
 * Dev-only middleware: serves POST /api/chat in-process so `npm run dev` is
 * a full same-origin stack (Vite UI → this handler → Groq), exactly mirroring
 * how Vercel routes /api/* in production. The SAME `(req, res)` handler from
 * api/chat.ts is used — the Vercel Node.js Functions API contract — so
 * local dev exercises the exact production request/response interface. No
 * separate server, no CORS. In production builds this plugin does nothing
 * (configureServer is dev-only) and the real function is deployed from api/chat.ts.
 *
 * Env: Vite only exposes VITE_* vars to the browser. For the dev handler we
 * load the project's real .env into this Node process (server-side only) so
 * the Groq key still never reaches the client.
 */
const handleChatRequest = createPortfolioHandler(createModelCall());

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

      // (req, res) are connect-style Node IncomingMessage / ServerResponse —
      // the same types the Vercel Node Functions API passes to the handler.
      server.middlewares.use("/api/chat", async (req, res) => {
        await handleChatRequest(req, res);
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