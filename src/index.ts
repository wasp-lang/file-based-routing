import type { FullOptions as Options } from "./in-files/types";

export type * from "./in-files/types";
export type { Options };
export function options<T extends Options>(opts: T): T {
  return opts;
}
