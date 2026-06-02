import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { completeUser } from "../helpers/fixtures";
import { importFreshUserRouter } from "../helpers/controller-mocks";

const CONTROLLER_MODULE = "../../src/modules/users/users.controller";

describe("users.router", () => {
  afterEach(() => {
    mock.restore();
  });

  beforeEach(() => {
    mock.restore();
  });

  test("POST /api/v1/user creates user", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createUser: mock(async () => completeUser),
      getUser: mock(),
      getUsers: mock(),
      patchUser: mock(),
      putUser: mock(),
      deleteUser: mock(),
    }));

    const { userRoutes } = await importFreshUserRouter("post");
    const handler = userRoutes["/api/v1/user"].POST;
    const response = await handler({
      json: async () => ({ fileName: "invoice.jpg" }),
    } as unknown as Bun.BunRequest<"/api/v1/user">);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(completeUser);
  });

  test("GET /api/v1/user/:userName returns user", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createUser: mock(),
      getUser: mock(async () => completeUser),
      getUsers: mock(),
      patchUser: mock(),
      putUser: mock(),
      deleteUser: mock(),
    }));

    const { userRoutes } = await importFreshUserRouter("get");
    const handler = userRoutes["/api/v1/user/:userName"].GET;
    const response = await handler({
      params: { userName: "Acme%20User%20Corp" },
    } as Bun.BunRequest<"/api/v1/user/:userName">);

    expect(await response.json()).toEqual(completeUser);
  });

  test("PATCH /api/v1/user/:userName updates user", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createUser: mock(),
      getUser: mock(),
      getUsers: mock(),
      patchUser: mock(async () => ({
        ...completeUser,
        email: "patched@example",
      })),
      putUser: mock(),
      deleteUser: mock(),
    }));

    const { userRoutes } = await importFreshUserRouter("patch");
    const handler = userRoutes["/api/v1/user/:userName"].PATCH;
    const response = await handler({
      json: async () => ({ fileName: "update.ogg" }),
      params: { userName: "Acme User Corp" },
    } as Bun.BunRequest<"/api/v1/user/:userName">);

    expect((await response.json()).email).toBe("patched@example");
  });

  test("DELETE /api/v1/user/:userName removes user", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createUser: mock(),
      getUser: mock(),
      getUsers: mock(),
      patchUser: mock(),
      putUser: mock(),
      deleteUser: mock(async () => true),
    }));

    const { userRoutes } = await importFreshUserRouter("delete");
    const handler = userRoutes["/api/v1/user/:userName"].DELETE;
    const response = await handler({
      params: { userName: "Acme User Corp" },
    } as Bun.BunRequest<"/api/v1/user/:userName">);

    expect(await response.text()).toBe("Old user successfully removed");
  });

  test("DELETE throws when removal fails", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createUser: mock(),
      getUser: mock(),
      getUsers: mock(),
      patchUser: mock(),
      putUser: mock(),
      deleteUser: mock(async () => false),
    }));

    const { userRoutes } = await importFreshUserRouter("deletefail");
    const handler = userRoutes["/api/v1/user/:userName"].DELETE;

    await expect(
      handler({
        params: { userName: "Acme User Corp" },
      } as Bun.BunRequest<"/api/v1/user/:userName">),
    ).rejects.toThrow("Could not remove user");
  });

  test("PUT /api/v1/user/:userName replaces user", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createUser: mock(),
      getUser: mock(),
      getUsers: mock(),
      patchUser: mock(),
      putUser: mock(async () => completeUser),
      deleteUser: mock(),
    }));

    const { userRoutes } = await importFreshUserRouter("put");
    const handler = userRoutes["/api/v1/user/:userName"].PUT;
    const response = await handler({
      json: async () => completeUser,
      params: { userName: "Acme User Corp" },
    } as Bun.BunRequest<"/api/v1/user/:userName">);

    expect(await response.json()).toEqual(completeUser);
  });

  test("GET /api/v1/users lists users", async () => {
    mock.module(CONTROLLER_MODULE, () => ({
      createUser: mock(),
      getUser: mock(),
      getUsers: mock(async () => [completeUser]),
      patchUser: mock(),
      putUser: mock(),
      deleteUser: mock(),
    }));

    const { userRoutes } = await importFreshUserRouter("list");
    const handler = userRoutes["/api/v1/users"].GET;
    const response = await handler();

    expect(await response.json()).toEqual([completeUser]);
  });
});
