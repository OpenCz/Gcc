import Elysia from "elysia";

export const adminAuth = new Elysia({ name: "adminAuth" })
  .onBeforeHandle(({ headers }) => {
    const token = headers["authorization"]?.replace("Bearer ", "");
    if (!token || token !== process.env.ADMIN_SECRET)
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
  });
