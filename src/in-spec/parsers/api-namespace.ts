import * as spec from "@wasp.sh/spec";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { makeSpecNameFromRoute } from "./util";

export const apiNamespaceParser: Parser = {
  globs: ["**/api-namespace" + ALLOWED_EXTENSIONS_GLOB],

  async parseFile(file, ctx) {
    const { route, baseSpecName } = makeSpecNameFromRoute(
      file.pathComponents,
      ctx,
    );

    const specApiNamespace = spec.apiNamespace(route, {
      middlewareConfigFn: ctx.ref({
        importDefault: baseSpecName + "ApiNamespace",
        from: file.absFilePath,
      }),
    });

    return {
      elements: [specApiNamespace],
      claims: [
        { type: "file", path: file.absFilePath },
        // An api namespace is middleware on a path prefix, not a route, so it
        // claims no route (e.g. a page and a namespace can share a path).
      ],
    };
  },
};
