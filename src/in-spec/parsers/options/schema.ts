import * as z from "zod";
import type { FullOptions } from "../../../in-files/types";
import { RouteType } from "../../types";

export const ALLOWED_KEYS_FOR_ROUTE_TYPE: Record<
  RouteType,
  (keyof FullOptions)[]
> = {
  [RouteType.Page]: ["page", "route"],
  [RouteType.Query]: ["query"],
  [RouteType.Action]: ["action"],
  [RouteType.Job]: ["job"],
  [RouteType.Api]: ["api"],
  [RouteType.ApiNamespace]: [],
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
