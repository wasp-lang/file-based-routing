import * as routePath from "node:path/posix";
import type { ParserContext } from "../../in-spec/parsers/common";

export const ALLOWED_EXTENSIONS_GLOB = ".{m,c,}{t,j}s{,x}";

/** Matches a route group: a path component wrapped in parentheses. */
const ROUTE_GROUP_REGEX = /^\(.*\)$/;

export function makeSpecNameFromRoute(
  pathComponents: readonly string[],
  ctx: ParserContext,
  { extraNameParts }: { extraNameParts?: readonly string[] } = {},
) {
  const route = makeRouteFromPath(pathComponents);

  const name = route === "/" ? "Root" : route;

  const uniqueName = ctx.makeUniqueSpecName(
    addExtraParts(name, extraNameParts),
  );

  return { route, baseSpecName: uniqueName };
}

/**
 * Calculates the output route for a route file from its input path components
 * (the directory path leading to the file, plus the file name itself).
 *
 * The file name is dropped, and any route group components (path components
 * wrapped in parentheses, e.g. `(logged-in)`, used to organize files without
 * affecting the route) are removed, so e.g.
 * `["dashboard", "(logged-in)", "my-profile", "page.tsx"]` -> `/dashboard/my-profile`.
 */
export function makeRouteFromPath(pathComponents: readonly string[]): string {
  const routeComponents = pathComponents
    .slice(0, -1) // Drop the file name; only directories form the route.
    .filter((component) => !ROUTE_GROUP_REGEX.test(component)); // Drop route groups.

  return routePath.normalize(routePath.join("/", ...routeComponents));
}

export function makeSpecNameFromPath(
  pathComponents: readonly string[],
  ctx: ParserContext,
  { extraNameParts }: { extraNameParts?: readonly string[] } = {},
) {
  // biome-ignore lint/style/noNonNullAssertion: a path always has at least one component
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
