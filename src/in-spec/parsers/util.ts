import * as routePath from "node:path/posix";
import type { ParserContext } from "./common";

export function makeSpecNameFromRoute(
  pathComponents: readonly string[],
  ctx: ParserContext,
) {
  const route = routePath.normalize(
    routePath.join("/", ...pathComponents.slice(0, -1)),
  );

  const name = route === "/" ? "Root" : route;
  const uniqueName = ctx.makeUniqueSpecName(name);

  return { route, baseSpecName: uniqueName };
}

export function makeSpecNameFromPath(
  pathComponents: readonly string[],
  ctx: ParserContext,
) {
  const fileName = pathComponents.at(-1)!;

  const name = fileName.slice(0, fileName.lastIndexOf("."));
  const uniqueName = ctx.makeUniqueSpecName(name);

  return { baseSpecName: uniqueName };
}
