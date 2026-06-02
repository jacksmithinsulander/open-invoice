import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { completeUser } from "../helpers/fixtures";
import {
  importFreshUserController,
  mockReadMedia,
  mockUserRepository,
  userServiceInstance,
} from "../helpers/controller-mocks";
import {
  mockFetchNominatim,
  mockOllama,
  mockOllamaReplaceFullAddress,
  restoreFetch,
} from "../helpers/mocks";
import { UserService } from "../../src/modules/users/users.service";

describe("users.controller", () => {
  beforeEach(() => {
    mockOllama();
    mockFetchNominatim();
    mockReadMedia();
    mockUserRepository();
  });

  afterEach(() => {
    mock.restore();
    restoreFetch();
  });

  test("getUser decodes URI component", async () => {
    const controller = await importFreshUserController("get");
    const user = await controller.getUser(encodeURIComponent("Acme User Corp"));

    expect(user.orgName).toBe(completeUser.orgName);
  });

  test("getUsers returns user list", async () => {
    const controller = await importFreshUserController("list");
    const users = await controller.getUsers();

    expect(users).toHaveLength(1);
  });

  test("createUser reads media and saves user", async () => {
    const controller = await importFreshUserController("create");
    const user = await controller.createUser("invoice.jpg");

    expect(user.orgName).toBe(completeUser.orgName);
  });

  test("deleteUser returns true", async () => {
    const controller = await importFreshUserController("delete");
    const result = await controller.deleteUser("Acme User Corp");

    expect(result).toBe(true);
  });

  test("putUser throws without orgName", async () => {
    const controller = await importFreshUserController("put");
    const invalidUser = { ...completeUser };
    delete invalidUser.orgName;

    await expect(
      controller.putUser(invalidUser, "Acme User Corp"),
    ).rejects.toThrow("You must send the new payee with full org name");
  });

  test("putUser replaces user using new body and old name", async () => {
    const updatedUser = { ...completeUser, email: "put@example.com" };
    const replacement = new UserService(updatedUser);
    const replaceUser = mock(async () => replacement);
    mock.restore();
    mockUserRepository({
      replaceUser,
      getUser: mock(async () => userServiceInstance),
    });

    const controller = await importFreshUserController("putreplace");
    const user = await controller.putUser(updatedUser, "Acme User Corp");

    expect(replaceUser).toHaveBeenCalledWith(replacement, "Acme User Corp");
    expect(user.email).toBe("put@example.com");
  });

  test("patchUser partial update path", async () => {
    mock.restore();
    mockOllamaReplaceFullAddress(false);
    mockFetchNominatim();
    mockReadMedia("patch text");
    mockUserRepository({
      getUser: mock(async () => userServiceInstance),
      replaceUser: mock(async (svc) => svc),
    });

    const controller = await importFreshUserController("patch");
    const user = await controller.patchUser("update.ogg", "Acme User Corp");

    expect(user.email).toBe("patched@acme.example");
  });

  test("patchUser full address replace path", async () => {
    mock.restore();
    mockOllamaReplaceFullAddress(true);
    mockFetchNominatim();
    mockReadMedia("new full address text");
    mockUserRepository({
      getUser: mock(async () => userServiceInstance),
      replaceUser: mock(async (svc) => svc),
    });

    const controller = await importFreshUserController("full");
    const user = await controller.patchUser("update.ogg", "Acme User Corp");

    expect(user.orgName).toBe(completeUser.orgName);
  });
});
