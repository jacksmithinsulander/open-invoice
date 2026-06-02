import { mock } from "bun:test";

import { completePayee, completeUser } from "./fixtures";
import { PayeeService } from "../../src/modules/payees/payees.service";
import { UserService } from "../../src/modules/users/users.service";

const CONTROLLER_PATH = "../../src/modules/payees/payees.controller";
const REPOSITORY_PATH = "../../src/modules/payees/payees.repository";
const ROUTER_PATH = "../../src/modules/payees/payees.router";
const USER_CONTROLLER_PATH = "../../src/modules/users/users.controller";
const USER_REPOSITORY_PATH = "../../src/modules/users/users.repository";
const USER_ROUTER_PATH = "../../src/modules/users/users.router";
const READ_MEDIA_PATH = "../../src/shared/utils/read-media";

const payeeServiceInstance = new PayeeService({ ...completePayee });
const userServiceInstance = new UserService({ ...completeUser });

export type RepositoryMock = {
  getPayee?: ReturnType<typeof mock>;
  getPayees?: ReturnType<typeof mock>;
  save?: ReturnType<typeof mock>;
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

export type UserRepositoryMock = {
  getUser?: ReturnType<typeof mock>;
  getUsers?: ReturnType<typeof mock>;
  save?: ReturnType<typeof mock>;
  deleteUser?: ReturnType<typeof mock>;
  replaceUser?: ReturnType<typeof mock>;
};

export function mockUserRepository(overrides: UserRepositoryMock = {}): void {
  mock.module(USER_REPOSITORY_PATH, () => ({
    UserRepository: mock(function UserRepositoryMock() {
      return {
        getUser: overrides.getUser ?? mock(async () => userServiceInstance),
        getUsers:
          overrides.getUsers ?? mock(async () => [userServiceInstance]),
        save: overrides.save ?? mock(async (svc: UserService) => svc),
        deleteUser: overrides.deleteUser ?? mock(async () => undefined),
        replaceUser:
          overrides.replaceUser ?? mock(async () => userServiceInstance),
      };
    }),
  }));
}

export async function importFreshUserController(suffix = "default") {
  return import(`${USER_CONTROLLER_PATH}?${suffix}=${Date.now()}`);
}

export async function importFreshUserRouter(suffix = "default") {
  return import(`${USER_ROUTER_PATH}?${suffix}=${Date.now()}`);
}

export { payeeServiceInstance, userServiceInstance };
