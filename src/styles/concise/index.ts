import type { Style } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import { apiNamespaceParser } from "../common/api-namespace";
import { actionParser } from "./action";
import { apiParser } from "./api";
import { pageParser } from "./page";
import { queryParser } from "./query";

/**
 * A terser variant of the default style: it has no options files and no jobs.
 * Instead, parameters are set with specially-named route group components:
 * `(prerender)` on a route, and `(auth)` on a page, api, query, or action.
 */
export const conciseStyle: Style = {
  parsers: {
    [RouteType.Page]: pageParser,
    [RouteType.Query]: queryParser,
    [RouteType.Action]: actionParser,
    [RouteType.Api]: apiParser,
    [RouteType.ApiNamespace]: apiNamespaceParser,
  },
};
