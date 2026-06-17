import * as routePath from "node:path/posix";
import type { ParserContext } from "./common";

export function makeSpecNameFromRoute(
  pathComponents: readonly string[],
  ctx: ParserContext,
  { extraNameParts }: { extraNameParts?: readonly string[] } = {},
) {
  const routeComponents = pathComponents
    .slice(0, -1)
    .filter((component) => !isRouteGroupComponent(component));

  const route = routePath.normalize(routePath.join("/", ...routeComponents));

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

  const name = fileName.slice(0, fileName.lastIndexOf("."));
  const uniqueName = ctx.makeUniqueSpecName(
    addExtraParts(name, extraNameParts),
  );

  return { baseSpecName: uniqueName };
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
