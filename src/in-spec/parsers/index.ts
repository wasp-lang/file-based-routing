import { RouteType } from "../types";
import { apiParser } from "./api";
import { apiNamespaceParser } from "./api-namespace";
import type { Parser } from "./common";
import { pageParser } from "./page";
import { queryParser } from "./query";

export const PARSERS_BY_ROUTE_TYPE: Record<RouteType, Parser> = {
  [RouteType.Page]: pageParser,
  [RouteType.Query]: queryParser,
  [RouteType.Api]: apiParser,
  [RouteType.ApiNamespace]: apiNamespaceParser,
};
