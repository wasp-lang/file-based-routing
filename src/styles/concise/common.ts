/**
 * In the concise style, configuration is carried by specially-named route group
 * components (path components wrapped in parentheses) rather than by sibling
 * options files. Like any route group, these are stripped from the output route
 * by `makeRouteFromPath`, so they organize files and toggle a setting at once.
 */
const AUTH_GROUP = "(auth)";
const PRERENDER_GROUP = "(prerender)";

/** Whether the path opts a page/api/query/action into requiring auth. */
export function hasAuthGroup(pathComponents: readonly string[]): boolean {
  return pathComponents.includes(AUTH_GROUP);
}

/** Whether the path opts a route into prerendering. */
export function hasPrerenderGroup(pathComponents: readonly string[]): boolean {
  return pathComponents.includes(PRERENDER_GROUP);
}
