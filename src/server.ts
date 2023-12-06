import Elysia from "elysia";
import authRoutes from "./routes/auth/index";
import userRoutes from "./routes/user/index";
import uniqueUsernameRoute from "./routes/unique-username";
import { Error, HttpCode, HuginnErrorData } from "@shared/errors";
import { createError } from "./factory/error-factory";
import { setup } from "./route-utils";
import { consola } from "consola";
import { colors } from "consola/utils";
import { version } from "../package.json";
import { logReject, logRequest, logResponse, logServerError } from "./log-utils";

let app: Elysia;

export function startServer(hostname: string, port: number) {
   consola.info(`Using version ${version}`);
   consola.start("Starting server...");

   app = new Elysia();

   app.onBeforeHandle(({ request, path, body }) => {
      if (request.method !== "OPTIONS") {
         logRequest(path, request.method, body);
      }
   });

   app.onAfterHandle(({ request, path, response, set }) => {
      if (request.method === "OPTIONS") {
         return;
      }

      if (!set.status || typeof set.status === "string") {
         return;
      }

      if (set.status >= 200 && set.status < 300) {
         logResponse(path, set.status, response);
      } else if (set.status === 500) {
         logReject(path, undefined, set.status);
      } else {
         logReject(path, response as HuginnErrorData, set.status);
      }
   });

   app.onError((ctx) => {
      if (ctx.code === "UNKNOWN") {
         logServerError(ctx.path, ctx.error);
         return ctx.error;
      }

      logReject(ctx.path, ctx.code);

      if (ctx.code === "VALIDATION") {
         ctx.set.status = HttpCode.BAD_REQUEST;
         return createError(Error.invalidFormBody()).toObject();
      }

      return ctx.error;
   });

   app.use(setup).use(authRoutes).use(userRoutes).use(uniqueUsernameRoute);

   app.listen({ hostname, port });

   consola.success("Server started!");
   consola.box(`Listening on ${colors.green(`http://${app.server?.hostname}:${app.server?.port}`)}`);
}
