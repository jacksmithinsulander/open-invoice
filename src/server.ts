import { connectDb } from "./db/client";
import { payeeRoutes } from "./modules/payees/payees.router";

await connectDb();

const server = Bun.serve({
  routes: {
    "/api/status": new Response("OK"),
    // Wildcard route for all routes that start with "/api/" and aren't otherwise matched
    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
    ...payeeRoutes,
  },
  fetch(_req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at ${server.url}`);
