import {
  createRawUserFromText,
  shouldReplaceFullAddress,
  updateUserFromText,
  updateRawUserFromText,
} from "../../shared/utils/ai-parse";
import { readFile } from "../../shared/utils/read-media";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";
import type { User, UserRawAddress } from "./users.types";

const userRepository = new UserRepository();

export const getUser = async (userName: string): Promise<User> => {
  const userNameDecoded: string = decodeURIComponent(userName);
  const repositoryLookup: UserService =
    await userRepository.getUser(userNameDecoded);
  const user: User = repositoryLookup.user;
  return user;
};

export const getUsers = async (): Promise<User[]> => {
  const repositoryLookup: UserService[] = await userRepository.getUsers();
  const users: User[] = repositoryLookup.map((entry) => entry.user);
  return users;
};

export const createUser = async (fileName: string): Promise<User> => {
  const rawText: string = await readFile(fileName);
  const rawUser: UserRawAddress = await createRawUserFromText(rawText);
  const userService: UserService = await UserService.init(rawUser);
  const result: UserService = await userRepository.save(userService);
  return result.export();
};

export const deleteUser = async (userName: string): Promise<boolean> => {
  await userRepository.deleteUser(userName);
  return true;
};

export const putPayee = async (
  newUser: User,
  oldUserName: string,
): Promise<User> => {
  if (!newUser.orgName) {
    throw new Error("You must send the new payee with full org name");
  }
  const newUserService: UserService = await userRepository.replaceUser(
    new UserService(newUser),
    oldUserName,
  );
  return newUserService.export();
};

export const patchUser = async (
  fileName: string,
  userName: string,
): Promise<User> => {
  const userService: UserService = await userRepository.getUser(userName);
  const rawText = await readFile(fileName);
  const user: User = userService.export();
  let userNew: User;
  const shouldReplaceEntireAddress: boolean = await shouldReplaceFullAddress(
    user,
    rawText,
  );
  if (shouldReplaceEntireAddress) {
    const userRaw: UserRawAddress = userService.toUserRawAddress();
    const updatedUserRaw: UserRawAddress = await updateRawUserFromText(
      userRaw,
      rawText,
    );
    const userServiceNew: UserService =
      await UserService.init(updatedUserRaw);
    const userServiceSaved: UserService = await userRepository.replaceUser(
      userServiceNew,
      userName,
    );
    userNew = userServiceSaved.export();
  } else {
    userNew = await updateUserFromText(user, rawText);
    const userServiceSaved: UserService = await userRepository.replaceUser(
      new UserService(userNew),
      userName,
    );
    userNew = userServiceSaved.export();
  }
  return userNew;
};
