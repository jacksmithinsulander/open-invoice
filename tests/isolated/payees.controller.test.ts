import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { completePayee } from "../helpers/fixtures";
import {
  importFreshController,
  mockPayeeRepository,
  mockReadMedia,
  payeeServiceInstance,
} from "../helpers/controller-mocks";
import {
  mockFetchNominatim,
  mockOllama,
  mockOllamaReplaceFullAddress,
  restoreFetch,
} from "../helpers/mocks";
import { PayeeService } from "../../src/modules/payees/payees.service";

describe("payees.controller", () => {
  beforeEach(() => {
    mockOllama();
    mockFetchNominatim();
    mockReadMedia();
    mockPayeeRepository();
  });

  afterEach(() => {
    mock.restore();
    restoreFetch();
  });

  test("getPayee decodes URI component", async () => {
    const controller = await importFreshController("get");
    const payee = await controller.getPayee(encodeURIComponent("Acme Corp"));

    expect(payee.orgName).toBe(completePayee.orgName);
  });

  test("getPayees returns payee list", async () => {
    const controller = await importFreshController("list");
    const payees = await controller.getPayees();

    expect(payees).toHaveLength(1);
  });

  test("createPayee reads media and saves payee", async () => {
    const controller = await importFreshController("create");
    const payee = await controller.createPayee("invoice.jpg");

    expect(payee.orgName).toBe(completePayee.orgName);
  });

  test("deletePayee returns true", async () => {
    const controller = await importFreshController("delete");
    const result = await controller.deletePayee("Acme Corp");

    expect(result).toBe(true);
  });

  test("putPayee throws without orgName", async () => {
    const controller = await importFreshController("put");
    const invalidPayee = { ...completePayee };
    delete invalidPayee.orgName;

    await expect(
      controller.putPayee(invalidPayee, "Acme Corp"),
    ).rejects.toThrow("You must send the new payee with full org name");
  });

  test("putPayee replaces payee using new body and old name", async () => {
    const updatedPayee = { ...completePayee, email: "put@example.com" };
    const replacement = new PayeeService(updatedPayee);
    const replacePayee = mock(async () => replacement);
    mock.restore();
    mockPayeeRepository({
      replacePayee,
      getPayee: mock(async () => payeeServiceInstance),
    });

    const controller = await importFreshController("putreplace");
    const payee = await controller.putPayee(updatedPayee, "Acme Corp");

    expect(replacePayee).toHaveBeenCalledWith(replacement, "Acme Corp");
    expect(payee.email).toBe("put@example.com");
  });

  test("patchPayee partial update path", async () => {
    mock.restore();
    mockOllamaReplaceFullAddress(false);
    mockFetchNominatim();
    mockReadMedia("patch text");
    mockPayeeRepository({
      getPayee: mock(async () => payeeServiceInstance),
      replacePayee: mock(async (svc) => svc),
    });

    const controller = await importFreshController("patch");
    const payee = await controller.patchPayee("update.ogg", "Acme Corp");

    expect(payee.email).toBe("patched@acme.example");
  });

  test("patchPayee full address replace path", async () => {
    mock.restore();
    mockOllamaReplaceFullAddress(true);
    mockFetchNominatim();
    mockReadMedia("new full address text");
    mockPayeeRepository({
      getPayee: mock(async () => payeeServiceInstance),
      replacePayee: mock(async (svc) => svc),
    });

    const controller = await importFreshController("full");
    const payee = await controller.patchPayee("update.ogg", "Acme Corp");

    expect(payee.orgName).toBe(completePayee.orgName);
  });
});
