import * as routePath from "node:path/posix";
import type { ParserContext, ParserFile } from "./common";

export function computeRoute(file: ParserFile, ctx: ParserContext) {
  const route = routePath.normalize(
    routePath.join("/", ...file.pathComponents.slice(0, -1)),
  );

  const baseSpecName = ctx.makeUniqueSpecName(route === "/" ? "Root" : route);

  return { route, baseSpecName };
}
