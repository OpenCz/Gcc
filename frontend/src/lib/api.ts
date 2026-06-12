export const API: string =
  (typeof process !== "undefined" && process.env.API_URL) || "http://localhost:8080";
