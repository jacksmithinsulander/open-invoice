import type { PayeeInstance } from "./payee";
import { PayeeRepository } from "./persistence";
import type { Payee } from "./types";

const server = Bun.serve({
  routes: {
    "/api/status": new Response("OK"),
    "/api/payee/:payeeName": async (req) => {
      const payeeNameDecoded: string = decodeURIComponent(req.params.payeeName);
      const payeeRepository = new PayeeRepository();
      const repositoryLookup: PayeeInstance =
        await payeeRepository.getPayee(payeeNameDecoded);
      const payee: Payee = repositoryLookup.payee;
      return Response.json(payee);
    },
    "/api/payees": async () => {
      const payeeRepository = new PayeeRepository();
      const repositoryLookup: PayeeInstance[] =
        await payeeRepository.getPayees();
      const payees = repositoryLookup.map((entry) => entry.payee);
      return Response.json(payees);
    },
  },
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at ${server.url}`);
