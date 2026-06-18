/**
 * Translates a page file's directory components into route segments,
 * expanding the bracket syntax for dynamic, optional, and splat segments:
 *
 * - `[id]`      -> `:id`     (dynamic parameter)
 * - `[[lang]]`  -> `:lang?`  (optional dynamic parameter)
 * - `[...rest]` -> `*`       (splat, trailing segment only)
 *
 * Other components (including route groups like `(logged-in)`) are returned
 * unchanged.
 */
export function transformSpecialRouteComponents(
  pathComponents: readonly string[],
): string[] {
  // The last component is the `page.tsx` filename, so the last component that
  // is part of the route is the second-to-last one.
  const lastRouteComponentIndex = pathComponents.length - 2;

  return pathComponents.map((part, i) => {
    {
      // Rest (wildcard) component. It must be named `[...rest]` and can only
      // appear as the last component of the route.
      const match = part.match(/^\[\.\.\.(.*)\]$/);
      if (match) {
        if (match[1] !== "rest") {
          throw new Error(
            `Wildcard path component "${part}" must be named "[...rest]".`,
          );
        }
        if (i !== lastRouteComponentIndex) {
          throw new Error(
            `Wildcard path component "${part}" must be the last component of the route.`,
          );
        }
        return "*";
      }
    }

    {
      // Optional dynamic path component
      const match = part.match(/^\[\[(.*)\]\]$/);
      if (match) {
        return ":" + match[1] + "?";
      }
    }

    {
      // Dynamic path component
      const match = part.match(/^\[(.*)\]$/);
      if (match) {
        return ":" + match[1];
      }
    }

    return part;
  });
}
