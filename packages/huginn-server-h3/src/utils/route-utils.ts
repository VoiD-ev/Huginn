import { prisma } from "@/database";
import { unauthorized } from "@huginn/backend-shared";
import { getHeader, H3Event } from "h3";
import { sha256 } from "ohash";
import { verifyToken } from "./token-factory";

export async function useVerifiedJwt(event: H3Event) {
   const bearer = getHeader(event, "Authorization");

   if (!bearer) {
      throw unauthorized(event);
   }

   const token = bearer.split(" ")[1];

   const { valid, payload } = await verifyToken(token);

   if (!valid || !payload) {
      throw unauthorized(event);
   }

   if (!(await prisma.user.exists({ id: BigInt(payload.id) }))) {
      throw unauthorized(event);
   }

   return { payload, token };
}

export function getFileHash(file: Buffer) {
   const hash = sha256(file.toString()).substring(0, 32);
   return hash;
}
