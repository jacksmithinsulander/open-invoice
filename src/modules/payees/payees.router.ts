import * as payeeController from "./payees.controller";

export const payeeRoutes = {
  "/api/v1/payee/:payeeName": {
    async GET(req: Bun.BunRequest<"/api/v1/payee/:payeeName">) {
      const payee = await payeeController.getPayee(req.params.payeeName);
      return Response.json(payee);
    },
  },
  "/api/v1/payees": {
    async GET() {
      const payees = await payeeController.getPayees();
      return Response.json(payees);
    },
  },
};
