import { DBErrorType, prisma } from "@/src/db";
import { createError } from "@/src/factory/error-factory";
import { createTokens } from "@/src/factory/token-factory";
import { error, hValidator, handleRequest } from "@/src/route-utils";
import { APIPostLoginResult } from "@shared/api-types";
import { constants } from "@shared/constants";
import { Error, Field, HttpCode } from "@shared/errors";
import { idFix } from "@shared/utils";
import { Hono } from "hono";
import { z } from "zod";

const schema = z.object({
   username: z.optional(z.string()),
   email: z.optional(z.string()),
   password: z.string(),
});

const app = new Hono();

app.post("/auth/login", hValidator("json", schema), c =>
   handleRequest(
      c,
      async () => {
         const body = c.req.valid("json");
         const user = idFix(await prisma.user.findByCredentials(body));

         const [accessToken, refreshToken] = await createTokens(
            { id: user.id },
            constants.ACCESS_TOKEN_EXPIRE_TIME,
            constants.REFRESH_TOKEN_EXPIRE_TIME
         );
         const json: APIPostLoginResult = { ...user, token: accessToken, refreshToken: refreshToken };

         return c.json(json, HttpCode.OK);
      },
      e => {
         if (e.isErrorType(DBErrorType.NULL_USER)) {
            return error(
               c,
               createError(Error.invalidFormBody()).error("login", Field.invalidLogin()).error("password", Field.invalidLogin())
            );
         }
      }
   )
);

export default app;
