import Elysia from "elysia";

export const adminAuth = new Elysia({ name: "adminAuth" })
  .onBeforeHandle(({ headers, set }) => {
    const token = headers["authorization"]?.replace("Bearer ", "");
    if (!token || token !== process.env.ADMIN_SECRET) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
  });
