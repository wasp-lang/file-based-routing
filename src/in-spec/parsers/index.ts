import { RouteType } from "../types";
import { apiParser } from "./api";
import { apiNamespaceParser } from "./api-namespace";
import type { Parser } from "./common";
import { pageParser } from "./page";

export const PARSERS_BY_ROUTE_TYPE: Record<RouteType, Parser> = {
  [RouteType.Page]: pageParser,
  [RouteType.Api]: apiParser,
  [RouteType.ApiNamespace]: apiNamespaceParser,
};
