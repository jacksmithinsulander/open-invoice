import { mock } from "bun:test";

import { completePayee } from "./fixtures";
import { PayeeService } from "../../src/modules/payees/payees.service";

export const CONTROLLER_PATH = "../../src/modules/payees/payees.controller";
export const REPOSITORY_PATH = "../../src/modules/payees/payees.repository";
export const ROUTER_PATH = "../../src/modules/payees/payees.router";
export const READ_MEDIA_PATH = "../../src/shared/utils/read-media";

const payeeServiceInstance = new PayeeService({ ...completePayee });

export type RepositoryMock = {
  getPayee?: ReturnType<typeof mock>;
  getPayees?: ReturnType<typeof mock>;
  save?: ReturnType<typeof mock>;
  savePayee?: ReturnType<typeof mock>;
  deletePayee?: ReturnType<typeof mock>;
  replacePayee?: ReturnType<typeof mock>;
};

export function mockPayeeRepository(overrides: RepositoryMock = {}): void {
  mock.module(REPOSITORY_PATH, () => ({
    PayeeRepository: mock(function PayeeRepositoryMock() {
      return {
        getPayee: overrides.getPayee ?? mock(async () => payeeServiceInstance),
        getPayees:
          overrides.getPayees ?? mock(async () => [payeeServiceInstance]),
        save: overrides.save ?? mock(async (svc: PayeeService) => svc),
        savePayee:
          overrides.savePayee ?? mock(async () => payeeServiceInstance),
        deletePayee: overrides.deletePayee ?? mock(async () => undefined),
        replacePayee:
          overrides.replacePayee ?? mock(async () => payeeServiceInstance),
      };
    }),
  }));
}

export function mockReadMedia(text = "ocr text"): void {
  mock.module(READ_MEDIA_PATH, () => ({
    readFile: mock(async () => text),
  }));
}

export async function importFreshController(suffix = "default") {
  return import(`${CONTROLLER_PATH}?${suffix}=${Date.now()}`);
}

export async function importFreshRouter(suffix = "default") {
  return import(`${ROUTER_PATH}?${suffix}=${Date.now()}`);
}

export { payeeServiceInstance };
