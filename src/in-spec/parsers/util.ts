import * as routePath from "node:path/posix";
import type { ParserContext } from "./common";

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
 * The file name is dropped, and any route group components (see
 * {@link isRouteGroupComponent}) are removed, so e.g.
 * `["dashboard", "(logged-in)", "my-profile", "page.tsx"]` -> `/dashboard/my-profile`.
 */
export function makeRouteFromPath(pathComponents: readonly string[]): string {
  const routeComponents = pathComponents
    .slice(0, -1) // Drop the file name; only directories form the route.
    .filter((component) => !isRouteGroupComponent(component));

  return routePath.normalize(routePath.join("/", ...routeComponents));
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

/**
 * A route group is a path component wrapped in parentheses (e.g.
 * `(logged-in)`). It's used to organize files without affecting the generated
 * route (e.g. `dashboard/(logged-in)/my-profile/page.tsx` -> `/dashboard/my-profile`).
 */
function isRouteGroupComponent(component: string): boolean {
  return /^\(.*\)$/.test(component);
}

function addExtraParts(name: string, extraNameParts: readonly string[] = []) {
  // Extra parts are joined with spaces so `makeUniqueSpecName`'s pascal-casing
  // folds them into the name (e.g. route `/tasks` + `GET` -> `TasksGet`).
  return [name, ...extraNameParts].join(" ");
}
