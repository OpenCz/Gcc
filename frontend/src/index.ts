import { serve } from "bun";
import index from "./index.html";

const server = serve({
  port: parseInt(process.env.PORT ?? "6767"),
  routes: {
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

const publicUrl = process.env.PUBLIC_URL ?? server.url.toString();
console.log(`
┌─────────────────────────────────────────┐
│         GCC — Dev Environment           │
├─────────────────────────────────────────┤
│  Frontend  →  ${publicUrl.padEnd(25)}│
│  Backend   →  http://localhost:8080     │
└─────────────────────────────────────────┘
`);
