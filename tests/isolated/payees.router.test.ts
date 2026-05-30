import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { completePayee } from "../helpers/fixtures";
import { importFreshRouter } from "../helpers/controller-mocks";

const CONTROLLER_MODULE = "../../src/modules/payees/payees.controller";

describe("payees.router", () => {
  afterEach(() => {
    mock.restore();
  });

  beforeEach(() => {
    mock.restore();
  });

  test("POST /api/v1/payee creates payee", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createPayee: mock(async () => completePayee),
      getPayee: mock(),
      getPayees: mock(),
      patchPayee: mock(),
      putPayee: mock(),
      deletePayee: mock(),
    }));

    const { payeeRoutes } = await importFreshRouter("post");
    const handler = payeeRoutes["/api/v1/payee"].POST;
    const response = await handler({
      json: async () => ({ fileName: "invoice.jpg" }),
    } as unknown as Bun.BunRequest<"/api/v1/payee/:payeeName">);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(completePayee);
  });

  test("GET /api/v1/payee/:payeeName returns payee", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createPayee: mock(),
      getPayee: mock(async () => completePayee),
      getPayees: mock(),
      patchPayee: mock(),
      putPayee: mock(),
      deletePayee: mock(),
    }));

    const { payeeRoutes } = await importFreshRouter("get");
    const handler = payeeRoutes["/api/v1/payee/:payeeName"].GET;
    const response = await handler({
      params: { payeeName: "Acme%20Corp" },
    } as Bun.BunRequest<"/api/v1/payee/:payeeName">);

    expect(await response.json()).toEqual(completePayee);
  });

  test("PATCH /api/v1/payee/:payeeName updates payee", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createPayee: mock(),
      getPayee: mock(),
      getPayees: mock(),
      patchPayee: mock(async () => ({
        ...completePayee,
        email: "patched@example",
      })),
      putPayee: mock(),
      deletePayee: mock(),
    }));

    const { payeeRoutes } = await importFreshRouter("patch");
    const handler = payeeRoutes["/api/v1/payee/:payeeName"].PATCH;
    const response = await handler({
      json: async () => ({ fileName: "update.ogg" }),
      params: { payeeName: "Acme Corp" },
    } as Bun.BunRequest<"/api/v1/payee/:payeeName">);

    expect((await response.json()).email).toBe("patched@example");
  });

  test("DELETE /api/v1/payee/:payeeName removes payee", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createPayee: mock(),
      getPayee: mock(),
      getPayees: mock(),
      patchPayee: mock(),
      putPayee: mock(),
      deletePayee: mock(async () => true),
    }));

    const { payeeRoutes } = await importFreshRouter("delete");
    const handler = payeeRoutes["/api/v1/payee/:payeeName"].DELETE;
    const response = await handler({
      params: { payeeName: "Acme Corp" },
    } as Bun.BunRequest<"/api/v1/payee/:payeeName">);

    expect(await response.text()).toBe("Old payee successfully removed");
  });

  test("DELETE throws when removal fails", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createPayee: mock(),
      getPayee: mock(),
      getPayees: mock(),
      patchPayee: mock(),
      putPayee: mock(),
      deletePayee: mock(async () => false),
    }));

    const { payeeRoutes } = await importFreshRouter("deletefail");
    const handler = payeeRoutes["/api/v1/payee/:payeeName"].DELETE;

    await expect(
      handler({
        params: { payeeName: "Acme Corp" },
      } as Bun.BunRequest<"/api/v1/payee/:payeeName">),
    ).rejects.toThrow("Could not remove payee");
  });

  test("PUT /api/v1/payee/:payeeName replaces payee", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createPayee: mock(),
      getPayee: mock(),
      getPayees: mock(),
      patchPayee: mock(),
      putPayee: mock(async () => completePayee),
      deletePayee: mock(),
    }));

    const { payeeRoutes } = await importFreshRouter("put");
    const handler = payeeRoutes["/api/v1/payee/:payeeName"].PUT;
    const response = await handler({
      json: async () => completePayee,
      params: { payeeName: "Acme Corp" },
    } as Bun.BunRequest<"/api/v1/payee/:payeeName">);

    expect(await response.json()).toEqual(completePayee);
  });

  test("GET /api/v1/payees lists payees", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createPayee: mock(),
      getPayee: mock(),
      getPayees: mock(async () => [completePayee]),
      patchPayee: mock(),
      putPayee: mock(),
      deletePayee: mock(),
    }));

    const { payeeRoutes } = await importFreshRouter("list");
    const handler = payeeRoutes["/api/v1/payees"].GET;
    const response = await handler();

    expect(await response.json()).toEqual([completePayee]);
  });
});
