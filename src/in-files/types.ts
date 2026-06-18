import type * as spec from "@wasp.sh/spec";
import type { SetOptional } from "type-fest";

export type RouteOptions = NonNullable<Parameters<typeof spec.route>[3]>;
export type PageOptions = NonNullable<Parameters<typeof spec.page>[1]>;
export type QueryOptions = NonNullable<Parameters<typeof spec.query>[1]>;
export type ActionOptions = NonNullable<Parameters<typeof spec.action>[1]>;
export type JobOptions = SetOptional<
  NonNullable<Parameters<typeof spec.job>[1]>,
  "executor"
>;
// `middlewareConfigFn` is omitted because it's a `ref` that can't be
// effectively referenced from an options file.
// https://github.com/wasp-lang/file-based-routing/issues/18
export type ApiOptions = Omit<
  NonNullable<Parameters<typeof spec.api>[3]>,
  "middlewareConfigFn"
>;

export interface FullOptions {
  route?: RouteOptions;
  page?: PageOptions;
  query?: QueryOptions;
  action?: ActionOptions;
  job?: JobOptions;
  api?: ApiOptions;
}
