import { PayeeRepository } from "./payees.repository";
import type { PayeeInstance } from "./payees.service";
import type { Payee } from "./payees.types";

const payeeRepository = new PayeeRepository();

const server = Bun.serve({
  routes: {
    "/api/status": new Response("OK"),
    "/api/v1/payee/:payeeName": {
      GET: async (req) => {
        const payeeNameDecoded: string = decodeURIComponent(
          req.params.payeeName,
        );
        const repositoryLookup: PayeeInstance =
          await payeeRepository.getPayee(payeeNameDecoded);
        const payee: Payee = repositoryLookup.payee;
        return Response.json(payee);
      },
    },
    "/api/v1/payees": {
      GET: async () => {
        const repositoryLookup: PayeeInstance[] =
          await payeeRepository.getPayees();
        const payees = repositoryLookup.map((entry) => entry.payee);
        return Response.json(payees);
      },
    },
    //"/api/payee/"
    // Wildcard route for all routes that start with "/api/" and aren't otherwise matched
    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
  },
  fetch(_req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at ${server.url}`);
