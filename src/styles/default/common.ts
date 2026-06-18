import * as routePath from "node:path/posix";
import type { ParserContext } from "../../in-spec/parsers/common";
import type { SpecNameCasing } from "../../in-spec/spec-name";

export const ALLOWED_EXTENSIONS_GLOB = ".{m,c,}{t,j}s{,x}";

/** Matches a route group: a path component wrapped in parentheses. */
const ROUTE_GROUP_REGEX = /^\(.*\)$/;

/**
 * A route group is a path component wrapped in parentheses (e.g. `(logged-in)`).
 * It organizes files without contributing a segment to the route, and works for
 * every kind of spec, including the route-less ones (queries, actions, jobs).
 */
export function isRouteGroup(component: string): boolean {
  return ROUTE_GROUP_REGEX.test(component);
}

/**
 * For file-based specs that live under a reserved top-level directory
 * (`queries/`, `actions/`, `jobs/`): a file is only matched when every directory
 * between the reserved directory and the file is a route group. These specs have
 * no route, so a route group is their only way to organize files into
 * subdirectories; a non-group subdirectory means the file is not matched.
 */
export function isReachableThroughRouteGroups(
  pathComponents: readonly string[],
): boolean {
  // Drop the reserved top-level directory (first) and the file name (last);
  // every remaining directory must be a route group.
  return pathComponents.slice(1, -1).every(isRouteGroup);
}

export function makeSpecNameFromRoute(
  pathComponents: readonly string[],
  ctx: ParserContext,
  {
    extraNameParts,
    casing,
  }: { extraNameParts?: readonly string[]; casing: SpecNameCasing },
) {
  const route = makeRouteFromPath(pathComponents);

  const name = route === "/" ? "Root" : route;

  const uniqueName = ctx.makeUniqueSpecName(
    addExtraParts(name, extraNameParts),
    casing,
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
    .filter((component) => !isRouteGroup(component)); // Drop route groups.

  return routePath.normalize(routePath.join("/", ...routeComponents));
}

export function makeSpecNameFromPath(
  pathComponents: readonly string[],
  ctx: ParserContext,
  {
    extraNameParts,
    casing,
  }: { extraNameParts?: readonly string[]; casing: SpecNameCasing },
) {
  // biome-ignore lint/style/noNonNullAssertion: a path always has at least one component
  const fileName = pathComponents.at(-1)!;

  const fileBaseName = fileName.slice(0, fileName.lastIndexOf("."));
  const uniqueName = ctx.makeUniqueSpecName(
    addExtraParts(fileBaseName, extraNameParts),
    casing,
  );

  return { baseSpecName: uniqueName, fileBaseName };
}

function addExtraParts(name: string, extraNameParts: readonly string[] = []) {
  // Extra parts are joined with spaces so `makeUniqueSpecName`'s case folding
  // merges them into the name (e.g. route `/tasks` + `GET` -> `tasksGet`).
  return [name, ...extraNameParts].join(" ");
}
