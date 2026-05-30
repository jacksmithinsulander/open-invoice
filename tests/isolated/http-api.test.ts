import { afterEach, describe, expect, mock, test } from "bun:test";

import { completePayee } from "../helpers/fixtures";

describe("HTTP API integration", () => {
  let server: ReturnType<typeof Bun.serve>;

  afterEach(() => {
    mock.restore();
    server?.stop(true);
  });

  test("serves payee routes over HTTP", async () => {
    mock.module("../../src/modules/payees/payees.controller", () => ({
      createPayee: mock(async () => completePayee),
      getPayee: mock(async () => completePayee),
      getPayees: mock(async () => [completePayee]),
      patchPayee: mock(async () => ({
        ...completePayee,
        email: "http-patched@example",
      })),
      putPayee: mock(async () => completePayee),
      deletePayee: mock(async () => true),
    }));

    const { payeeRoutes } = await import(
      "../../src/modules/payees/payees.router?http=" + Date.now()
    );

    server = Bun.serve({
      port: 0,
      routes: payeeRoutes,
    });

    const base = server.url.origin;

    const createRes = await fetch(`${base}/api/v1/payee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: "clujaddress.jpg" }),
    });
    expect(createRes.status).toBe(200);
    expect((await createRes.json()).orgName).toBe("Acme Corp");

    const getRes = await fetch(`${base}/api/v1/payee/Acme%20Corp`);
    expect(getRes.status).toBe(200);

    const listRes = await fetch(`${base}/api/v1/payees`);
    expect((await listRes.json()).length).toBe(1);

    const patchRes = await fetch(`${base}/api/v1/payee/Acme%20Corp`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: "cluj-request.ogg" }),
    });
    expect((await patchRes.json()).email).toBe("http-patched@example");

    const putRes = await fetch(`${base}/api/v1/payee/Acme%20Corp`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(completePayee),
    });
    expect(putRes.status).toBe(200);

    const deleteRes = await fetch(`${base}/api/v1/payee/Acme%20Corp`, {
      method: "DELETE",
    });
    expect(await deleteRes.text()).toBe("Old payee successfully removed");
  });
});
