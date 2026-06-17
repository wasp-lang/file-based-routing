import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile } from "./options";
import { makeSpecNameFromRoute } from "./util";

export const pageParser: Parser = {
  globs: ["**/page" + ALLOWED_EXTENSIONS_GLOB],

  async parseFile(file, ctx) {
    const transformedPathComponents = transformSpecialRouteComponents(
      file.pathComponents,
    );
    const { route, baseSpecName } = makeSpecNameFromRoute(
      transformedPathComponents,
      ctx,
    );

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Page,
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
        ...(options?.claims ?? []),
      ],
      // A page is served over GET, so it conflicts with a GET api on the
      // same path.
      routeClaims: [{ method: "GET", path: route }],
    };
  },
};

function transformSpecialRouteComponents(
  pathComponents: readonly string[],
): string[] {
  return pathComponents.map((part, i) => {
    {
      // Rest component at the end of the path
      // (In the path components it's the second-to-last component, because the
      // last one is the `page.tsx` filename)
      if (i === pathComponents.length - 2 && part === "[...rest]") {
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
