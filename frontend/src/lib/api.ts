declare const __API_URL__: string | undefined;

// In dev: __API_URL__ is undeclared → typeof returns "undefined" → fallback to localhost
// In prod: build.ts replaces __API_URL__ with the actual API_URL env var at build time
export const API: string =
  (typeof __API_URL__ !== "undefined" ? __API_URL__ : null) ?? "http://localhost:8080";
