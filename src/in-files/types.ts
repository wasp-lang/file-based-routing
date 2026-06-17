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
export type ApiOptions = NonNullable<Parameters<typeof spec.api>[3]>;

export interface FullOptions {
  route?: RouteOptions;
  page?: PageOptions;
  query?: QueryOptions;
  action?: ActionOptions;
  job?: JobOptions;
  api?: ApiOptions;
}
