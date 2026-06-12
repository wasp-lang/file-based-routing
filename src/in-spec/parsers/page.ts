import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile } from "./options";
import { computeRoute } from "./util";

export const pageParser: Parser = {
  globs: ["**/page" + ALLOWED_EXTENSIONS_GLOB],

  async parseFile(file, ctx) {
    const { route, baseSpecName } = computeRoute(file.pathComponents, ctx);

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Page,
    );

    const specPage = spec.page(
      ctx.ref({
        importDefault: baseSpecName + "Page",
        from: file.absFilePath,
      }),
      options?.page,
    );

    const specRoute = spec.route(
      baseSpecName + "Route",
      route,
      specPage,
      options?.route,
    );

    return [specPage, specRoute];
  },
};
