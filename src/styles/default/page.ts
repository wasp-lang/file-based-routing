import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import { transformSpecialRouteComponents } from "../common/page-segments";
import {
  ALLOWED_EXTENSIONS_GLOB,
  makeSpecNameFromRoute,
} from "../common/route-path";
import { discoverOptionsForFile } from "./options";

export const pageParser: Parser = {
  globs: ["**/page" + ALLOWED_EXTENSIONS_GLOB],

  async matchFile(file, ctx) {
    const transformedPathComponents = transformSpecialRouteComponents(
      file.pathComponents,
    );
    const { route, baseSpecName } = makeSpecNameFromRoute(
      transformedPathComponents,
      ctx,
    );

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Page,
      { baseName: "page" },
    );

    const specPage = spec.page(
      ctx.ref({
        importDefault: baseSpecName + "Page",
        from: file.absFilePath,
      }),
      options?.value.page,
    );

    const specRoute = spec.route(
      baseSpecName + "Route",
      route,
      specPage,
      options?.value.route,
    );

    return {
      elements: [specPage, specRoute],
      claims: [
        { type: "file", path: file.absFilePath },
        // A page is served over GET, so it conflicts with a GET (or ALL) api
        // on the same path.
        { type: "route", route, method: "GET" },
        ...(options?.claims ?? []),
      ],
    };
  },
};
