import { Prisma } from "@prisma/client";
import { APIPostLoginJSONBody, APIPostRegisterJSONBody, UserFlags } from "@huginn/shared";
import { snowflake } from "@huginn/shared";
import { DBErrorType, assertObj, prisma } from ".";

const authExtention = Prisma.defineExtension({
   name: "auth",
   model: {
      user: {
         async findByCredentials(credentials: APIPostLoginJSONBody) {
            const user = await prisma.user.findFirst({
               where: {
                  AND: [
                     { password: credentials.password },
                     { OR: [{ email: credentials.email }, { username: credentials.username }] },
                  ],
               },
            });

            assertObj("findByCredentials", user, DBErrorType.NULL_USER);
            return user as Required<Prisma.UserGetPayload<{ include: never; select: never }>>;
         },
         async registerNew(user: APIPostRegisterJSONBody) {
            const newUser = await prisma.user.create({
               data: {
                  id: snowflake.generate(),
                  username: user.username,
                  displayName: !user.displayName ? null : user.displayName,
                  password: user.password,
                  avatar: null,
                  email: user.email,
                  flags: UserFlags.NONE,
                  system: false,
               },
            });

            assertObj("registerNew", newUser, DBErrorType.NULL_USER);
            return newUser;
         },
      },
   },
});

export default authExtention;
