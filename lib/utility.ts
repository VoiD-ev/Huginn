import { APIChannel } from "./api-types";
import { GatewayOperations } from "./gateway-types";

export function pick<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Pick<Data, Keys> {
   const result = {} as Pick<Data, Keys>;

   for (const key of keys) {
      result[key] = data[key];
   }

   return result;
}

export function omit<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Omit<Data, Keys> {
   const result = { ...data };

   for (const key of keys) {
      delete result[key];
   }

   return result as Omit<Data, Keys>;
}

export function omitArray<Data extends object, Keys extends keyof Data>(
   data: Data[],
   keys: Keys[]
): Omit<Data, (typeof keys)[number]>[] {
   const result = [];

   for (const obj of [...data]) {
      const modifiedObj = { ...obj };
      for (const key of keys) {
         delete modifiedObj[key];
      }

      result.push(modifiedObj);
   }

   return result;
}

// export function merge<A extends object[]>(...a: [...A]) {
//    return Object.assign({}, ...a) as Spread<A>;
// }

type DeepMerge<T, U> = {
   [K in keyof T | keyof U]: K extends keyof T & keyof U
      ? DeepMerge<T[K], U[K]>
      : K extends keyof T
      ? T[K]
      : K extends keyof U
      ? U[K]
      : never;
};

function isObject(item: any): item is Object {
   return item && typeof item === "object" && !Array.isArray(item);
}

function deepMerge<T extends object, U extends object>(target: T, source: U): DeepMerge<T, U> {
   const output = { ...target } as any;

   if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
         if (isObject(source[key])) {
            if (!(key in target)) {
               output[key] = source[key];
            } else {
               output[key] = deepMerge((target as any)[key], source[key]);
            }
         } else {
            output[key] = source[key];
         }
      });
   }

   return output as DeepMerge<T, U>;
}

export function merge<T extends object[]>(...objects: T): DeepMerge<T[0], T[1]> {
   return objects.reduce((acc, obj) => deepMerge(acc, obj), {}) as DeepMerge<T[0], T[1]>;
}

type BigIntToString<T> = T extends bigint
   ? string
   : T extends Date
   ? Date
   : T extends Array<infer U>
   ? Array<BigIntToString<U>>
   : T extends object
   ? { [K in keyof T]: BigIntToString<T[K]> }
   : T;

export function idFix<T>(obj: T): BigIntToString<T> {
   if (Array.isArray(obj)) {
      return obj.map((item) => idFix(item)) as BigIntToString<T>;
   } else if (obj instanceof Date) {
      return obj as unknown as BigIntToString<T>; // Do not convert Date objects
   } else if (typeof obj === "object" && obj !== null) {
      const newObj: any = {};
      for (const key in obj) {
         if (typeof obj[key] === "bigint") {
            newObj[key] = obj[key].toString();
         } else if (typeof obj[key] === "object") {
            newObj[key] = idFix(obj[key]);
         } else {
            newObj[key] = obj[key];
         }
      }
      return newObj as BigIntToString<T>;
   } else {
      return obj as BigIntToString<T>;
   }
}

export function checkOpcode(data: unknown, opcode: GatewayOperations) {
   if (data && typeof data === "object") {
      return "op" in data && data.op === opcode;
   }

   return false;
}
