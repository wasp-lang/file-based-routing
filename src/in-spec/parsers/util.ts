import * as routePath from "node:path/posix";
import type * as spec from "@wasp.sh/spec";
import type { ParserContext } from "./common";

export function makeSpecNameFromRoute(
  pathComponents: readonly string[],
  ctx: ParserContext,
  { extraNameParts = [] }: { extraNameParts?: readonly string[] } = {},
) {
  const route = routePath.normalize(
    routePath.join("/", ...pathComponents.slice(0, -1)),
  );

  const name = route === "/" ? "Root" : route;
  // Extra parts are joined with spaces so `makeUniqueSpecName`'s pascal-casing
  // folds them into the name (e.g. route `/tasks` + `GET` -> `TasksGet`).
  const uniqueName = ctx.makeUniqueSpecName([name, ...extraNameParts].join(" "));

  return { route, baseSpecName: uniqueName };
}

/** Derives the HTTP method from an `<method>.api.<ext>` file name. */
export function apiMethodFromFileName(fileName: string): spec.HttpMethod {
  return fileName.split(".").at(0)!.toUpperCase() as spec.HttpMethod;
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
