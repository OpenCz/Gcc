import Elysia from "elysia";

export const adminAuth = new Elysia({ name: "adminAuth" }).derive(
  { as: "scoped" },
  ({ headers, error }) => {
    const token = headers["authorization"]?.replace("Bearer ", "");
    if (!token || token !== process.env.ADMIN_SECRET) {
      throw error(401, { message: "Unauthorized" });
    }
  }
);
