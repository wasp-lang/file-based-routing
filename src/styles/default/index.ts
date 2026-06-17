import type { Style } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import { actionParser } from "./action";
import { apiParser } from "./api";
import { apiNamespaceParser } from "./api-namespace";
import { jobParser } from "./job";
import { pageParser } from "./page";
import { queryParser } from "./query";

export type { Style };

/** The default set of file-based routing conventions. */
export const defaultStyle: Style = {
  parsers: {
    [RouteType.Page]: pageParser,
    [RouteType.Query]: queryParser,
    [RouteType.Action]: actionParser,
    [RouteType.Job]: jobParser,
    [RouteType.Api]: apiParser,
    [RouteType.ApiNamespace]: apiNamespaceParser,
  },
};
