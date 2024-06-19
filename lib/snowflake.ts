import { Snowflake as SnowflakeLibrary } from "@sapphire/snowflake";

export type Snowflake = string;

const epoch = new Date("2023-01-01T00:00:00.000Z");

const globalSnowflake = new SnowflakeLibrary(epoch);

export const snowflake = {
   generateString() {
      const value = globalSnowflake.generate();
      return value.toString();
   },
   generate() {
      const value = globalSnowflake.generate();
      return value;
   },
};
