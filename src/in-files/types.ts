import * as spec from "@wasp.sh/spec";

export type PageOptions = NonNullable<Parameters<typeof spec.page>[1]>;
export type RouteOptions = NonNullable<Parameters<typeof spec.route>[3]>;
export type ApiOptions = NonNullable<Parameters<typeof spec.api>[3]>;

export interface FullOptions {
  page?: PageOptions;
  route?: RouteOptions;
  api?: ApiOptions;
}
