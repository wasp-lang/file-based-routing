import * as routePath from "node:path/posix";
import type { ParserContext } from "./common";

export function computeRoute(
  pathComponents: readonly string[],
  ctx: ParserContext,
) {
  const route = routePath.normalize(
    routePath.join("/", ...pathComponents.slice(0, -1)),
  );

  const baseSpecName = ctx.makeUniqueSpecName(route === "/" ? "Root" : route);

  return { route, baseSpecName };
}
