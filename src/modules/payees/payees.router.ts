import * as payeeController from "./payees.controller";
import { Payee } from "./payees.types";

export const payeeRoutes = {
  "/api/v1/payee": {
    async POST(req: Bun.BunRequest<"/api/v1/payee/:payeeName">) {
      const body = await req.json();
      const fileName = body.fileName;
      const payee: Payee = await payeeController.createPayee(fileName);
      return Response.json(payee)
    }
  },
  "/api/v1/payee/:payeeName": {
    async GET(req: Bun.BunRequest<"/api/v1/payee/:payeeName">) {
      const payee: Payee = await payeeController.getPayee(req.params.payeeName);
      return Response.json(payee);
    },
    async PATCH(req: Bun.BunRequest<"/api/v1/payee/:payeeName">) {
      const body = await req.json();
      const fileName = body.fileName;
      const payee: Payee = await payeeController.patchPayee(
        fileName,
        req.params.payeeName,
      );
      return Response.json(payee);
    },
    async DELETE(req: Bun.BunRequest<"/api/v1/payee/:payeeName">) {
      const result: boolean = await payeeController.deletePayee(
        req.params.payeeName,
      );
      if (result) {
        return new Response("Old payee successfully removed");
      } else {
        throw new Error("Could not remove payee");
      }
    },
    async PUT(req: Bun.BunRequest<"/api/v1/payee/:payeeName">) {
      const newPayee: Payee = (await req.json()) as Payee;
      const payee: Payee = await payeeController.putPayee(
        newPayee,
        req.params.payeeName,
      );
      return Response.json(payee);
    },
  },
  "/api/v1/payees": {
    async GET() {
      const payees: Payee[] = await payeeController.getPayees();
      return Response.json(payees);
    },
  },
};
