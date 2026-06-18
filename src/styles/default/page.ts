import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import { ALLOWED_EXTENSIONS_GLOB, makeSpecNameFromRoute } from "./common";
import { discoverOptionsForFile } from "./options";

export const pageParser: Parser = {
  globs: ["**/page" + ALLOWED_EXTENSIONS_GLOB],

  async matchFile(file, ctx) {
    const transformedPathComponents = transformSpecialRouteComponents(
      file.pathComponents,
    );
    const { route, baseSpecName } = makeSpecNameFromRoute(
      transformedPathComponents,
      ctx,
      { casing: "PascalCase" },
    );

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Page,
      { baseName: "page" },
      ctx,
    );

    const specPage = spec.page(
      ctx.ref({
        importDefault: baseSpecName + "Page",
        from: file.absFilePath,
      }),
      options?.value.page,
    );

    const specRoute = spec.route(
      baseSpecName + "Route",
      route,
      specPage,
      options?.value.route,
    );

    return {
      elements: [specPage, specRoute],
      claims: [
        { type: "file", path: file.absFilePath },
        // A page is served over GET, so it conflicts with a GET (or ALL) api
        // on the same path.
        { type: "route", route, method: "GET" },
        ...(options?.claims ?? []),
      ],
    };
  },
};

function transformSpecialRouteComponents(
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
