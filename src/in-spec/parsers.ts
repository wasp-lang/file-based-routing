import * as spec from "@wasp.sh/spec";
import * as routePath from "node:path/posix";
import { discoverOptionsForFile } from "./options";
import type { RouteType } from "./types";

export const ALLOWED_EXTENSIONS_GLOB = ".{m,c,}{t,j}s{,x}";

interface Parser {
  globs: readonly string[];
  parseFile: (
    file: {
      pathComponents: readonly string[];
      absFilePath: string;
    },
    ctx: ParserContext,
  ) => Promise<spec.SpecElement[]>;
}

interface ParserContext {
  ref: typeof spec.ref;
  makeUniqueSpecName: (base: string) => string;
}

export const PARSERS_BY_ROUTE_TYPE: Record<RouteType, Parser> = {
  page: {
    globs: ["**/page" + ALLOWED_EXTENSIONS_GLOB],
    async parseFile(file, ctx) {
      const route = routePath.normalize(
        routePath.join("/", ...file.pathComponents.slice(0, -1)),
      );
      const specName = ctx.makeUniqueSpecName(route === "/" ? "Root" : route);

      const options = await discoverOptionsForFile(file.absFilePath, "page");

      const specPage = spec.page(
        ctx.ref({ importDefault: specName + "Page", from: file.absFilePath }),
        options?.page,
      );

      const specRoute = spec.route(
        specName + "Route",
        route,
        specPage,
        options?.route,
      );

      return [specPage, specRoute];
    },
  },
};
