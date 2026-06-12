import * as spec from "@wasp.sh/spec";

export type PageOptions = NonNullable<Parameters<typeof spec.page>[1]>;
export type QueryOptions = NonNullable<Parameters<typeof spec.query>[1]>;
export type RouteOptions = NonNullable<Parameters<typeof spec.route>[3]>;
export type ApiOptions = NonNullable<Parameters<typeof spec.api>[3]>;

export interface FullOptions {
  page?: PageOptions;
  query?: QueryOptions;
  route?: RouteOptions;
  api?: ApiOptions;
}
