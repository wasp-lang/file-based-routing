import * as routePath from "node:path/posix";
import type { ParserContext } from "./common";

export function makeSpecNameFromRoute(
  pathComponents: readonly string[],
  ctx: ParserContext,
  { extraNameParts }: { extraNameParts?: readonly string[] } = {},
) {
  const route = routePath.normalize(
    routePath.join("/", ...pathComponents.slice(0, -1)),
  );

  const name = route === "/" ? "Root" : route;

  const uniqueName = ctx.makeUniqueSpecName(
    addExtraParts(name, extraNameParts),
  );

  return { route, baseSpecName: uniqueName };
}

export function makeSpecNameFromPath(
  pathComponents: readonly string[],
  ctx: ParserContext,
  { extraNameParts }: { extraNameParts?: readonly string[] } = {},
) {
  const fileName = pathComponents.at(-1)!;

  const fileBaseName = fileName.slice(0, fileName.lastIndexOf("."));
  const uniqueName = ctx.makeUniqueSpecName(
    addExtraParts(fileBaseName, extraNameParts),
  );

  return { baseSpecName: uniqueName, fileBaseName };
}

function addExtraParts(name: string, extraNameParts: readonly string[] = []) {
  // Extra parts are joined with spaces so `makeUniqueSpecName`'s pascal-casing
  // folds them into the name (e.g. route `/tasks` + `GET` -> `TasksGet`).
  return [name, ...extraNameParts].join(" ");
}
