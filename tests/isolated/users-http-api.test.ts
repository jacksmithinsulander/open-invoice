import { afterEach, describe, expect, mock, test } from "bun:test";

import { completeUser } from "../helpers/fixtures";

describe("users HTTP API integration", () => {
  let server: ReturnType<typeof Bun.serve>;

  afterEach(() => {
    mock.restore();
    server?.stop(true);
  });

  test("serves user routes over HTTP", async () => {
    mock.module("../../src/modules/users/users.controller", () => ({
      createUser: mock(async () => completeUser),
      getUser: mock(async () => completeUser),
      getUsers: mock(async () => [completeUser]),
      patchUser: mock(async () => ({
        ...completeUser,
        email: "http-patched@example",
      })),
      putUser: mock(async () => completeUser),
      deleteUser: mock(async () => true),
    }));

    const { userRoutes } = await import(
      "../../src/modules/users/users.router?http=" + Date.now()
    );

    server = Bun.serve({
      port: 0,
      routes: userRoutes,
    });

    const base = server.url.origin;

    const createRes = await fetch(`${base}/api/v1/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: "clujaddress.jpg" }),
    });
    expect(createRes.status).toBe(200);
    expect((await createRes.json()).orgName).toBe("Acme User Corp");

    const getRes = await fetch(`${base}/api/v1/user/Acme%20User%20Corp`);
    expect(getRes.status).toBe(200);

    const listRes = await fetch(`${base}/api/v1/users`);
    expect((await listRes.json()).length).toBe(1);

    const patchRes = await fetch(`${base}/api/v1/user/Acme%20User%20Corp`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: "cluj-request.ogg" }),
    });
    expect((await patchRes.json()).email).toBe("http-patched@example");

    const putRes = await fetch(`${base}/api/v1/user/Acme%20User%20Corp`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(completeUser),
    });
    expect(putRes.status).toBe(200);

    const deleteRes = await fetch(`${base}/api/v1/user/Acme%20User%20Corp`, {
      method: "DELETE",
    });
    expect(await deleteRes.text()).toBe("Old user successfully removed");
  });
});
