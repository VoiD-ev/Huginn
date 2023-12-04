import { APIUser } from "@shared/api-types";
import { Snowflake } from "@shared/types";
import mongoose from "mongoose";

export class Database {
   public static async initialize(connectionString: string, dbName: string) {
      await mongoose.connect(connectionString, { dbName });
   }
}

export type DBUser =
   | mongoose.Document<unknown, object, APIUser> &
        APIUser &
        Required<{
           _id: Snowflake;
        }>;

export * from "./database-auth";
export * from "./database-user";
export * from "./database-common";
export * from "./database-error";
