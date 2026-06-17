import * as z from "zod";
import type { FullOptions } from "../../../in-files/types";
import { RouteType } from "../../../in-spec/types";

export const ALLOWED_KEYS_FOR_ROUTE_TYPE: Record<
  RouteType,
  Partial<Record<keyof FullOptions, true>>
> = {
  [RouteType.Page]: { page: true, route: true },
  [RouteType.Query]: { query: true },
  [RouteType.Action]: { action: true },
  [RouteType.Job]: { job: true },
  [RouteType.Api]: { api: true },
  [RouteType.ApiNamespace]: {},
};

const uncheckedObject = <T extends {}>() =>
  z.looseObject({}).pipe(z.custom<T>());

export const FullOptionsSchema = z.object({
  page: uncheckedObject().optional(),
  query: uncheckedObject().optional(),
  action: uncheckedObject().optional(),
  route: uncheckedObject().optional(),
  job: uncheckedObject().optional(),
  api: uncheckedObject().optional(),
}) satisfies z.ZodType<FullOptions>;
