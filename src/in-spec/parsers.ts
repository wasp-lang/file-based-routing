import * as spec from "@wasp.sh/spec";
import * as routePath from "node:path/posix";
import { ALLOWED_EXTENSIONS_GLOB, RouteType } from "./common";
import { discoverOptionsForFile } from "./options";

interface Parser {
  globs: readonly string[];
  parseFile: (
    file: ParserFile,
    ctx: ParserContext,
  ) => Promise<spec.SpecElement[]>;
}

interface ParserFile {
  pathComponents: readonly string[];
  absFilePath: string;
}

interface ParserContext {
  ref: typeof spec.ref;
  makeUniqueSpecName: (base: string) => string;
}

export const PARSERS_BY_ROUTE_TYPE: Record<RouteType, Parser> = {
  [RouteType.Page]: {
    globs: ["**/page" + ALLOWED_EXTENSIONS_GLOB],
    async parseFile(file, ctx) {
      const { route, baseSpecName } = computeRoute(file, ctx);

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
  },

  [RouteType.Api]: {
    globs: ["**/*.api" + ALLOWED_EXTENSIONS_GLOB],
    async parseFile(file, ctx) {
      const { route, baseSpecName } = computeRoute(file, ctx);

      const method = file.pathComponents
        .at(-1)
        ?.split(".")
        .at(0)
        ?.toUpperCase() as spec.HttpMethod;

      const options = await discoverOptionsForFile(
        file.absFilePath,
        RouteType.Api,
      );

      const specApi = spec.api(
        method,
        route,
        ctx.ref({
          importDefault: baseSpecName + "Api",
          from: file.absFilePath,
        }),
        options?.api,
      );

      return [specApi];
    },
  },

  [RouteType.ApiNamespace]: {
    globs: ["**/api-namespace" + ALLOWED_EXTENSIONS_GLOB],
    async parseFile(file, ctx) {
      const { route, baseSpecName } = computeRoute(file, ctx);

      const specApiNamespace = spec.apiNamespace(route, {
        middlewareConfigFn: ctx.ref({
          importDefault: baseSpecName + "ApiNamespace",
          from: file.absFilePath,
        }),
      });

      return [specApiNamespace];
    },
  },
};

function computeRoute(file: ParserFile, ctx: ParserContext) {
  const route = routePath.normalize(
    routePath.join("/", ...file.pathComponents.slice(0, -1)),
  );

  const baseSpecName = ctx.makeUniqueSpecName(route === "/" ? "Root" : route);

  return { route, baseSpecName };
}
