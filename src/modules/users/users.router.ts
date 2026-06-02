import * as userController from "./users.controller";
import type { User } from "./users.types";

export const userRoutes = {
  "/api/v1/user": {
    async POST(req: Bun.BunRequest<"/api/v1/user">) {
      const { fileName } = (await req.json()) as { fileName: string };
      const user: User = await userController.createUser(fileName);
      return Response.json(user);
    },
  },
  "/api/v1/user/:userName": {
    async GET(req: Bun.BunRequest<"/api/v1/user/:userName">) {
      const user: User = await userController.getUser(req.params.userName);
      return Response.json(user);
    },
    async PATCH(req: Bun.BunRequest<"/api/v1/user/:userName">) {
      const { fileName } = (await req.json()) as { fileName: string };
      const user: User = await userController.patchUser(
        fileName,
        req.params.userName,
      );
      return Response.json(user);
    },
    async DELETE(req: Bun.BunRequest<"/api/v1/user/:userName">) {
      const result: boolean = await userController.deleteUser(
        req.params.userName,
      );
      if (result) {
        return new Response("Old user successfully removed");
      } else {
        throw new Error("Could not remove user");
      }
    },
    async PUT(req: Bun.BunRequest<"/api/v1/user/:userName">) {
      const newUser: User = (await req.json()) as User;
      const user: User = await userController.putUser(
        newUser,
        req.params.userName,
      );
      return Response.json(user);
    },
  },
  "/api/v1/users": {
    async GET() {
      const users: User[] = await userController.getUsers();
      return Response.json(users);
    },
  },
};
