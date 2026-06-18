import * as spec from "@wasp.sh/spec";
import type { RouteClaim } from "../../in-spec/claims";
import type { Parser } from "../../in-spec/parsers/common";
import {
  apiMethodFromFileName,
  HTTP_METHODS,
  HTTP_METHODS_GLOB,
} from "../common/http-methods";
import {
  ALLOWED_EXTENSIONS_GLOB,
  makeSpecNameFromRoute,
} from "../common/route-path";
import { hasAuthGroup } from "./common";

export const apiParser: Parser = {
  globs: [`**/${HTTP_METHODS_GLOB}.api` + ALLOWED_EXTENSIONS_GLOB],

  async matchFile(file, ctx) {
    // biome-ignore lint/style/noNonNullAssertion: glob match guarantees a path component
    const method = apiMethodFromFileName(file.pathComponents.at(-1)!);

    // The method is folded into the spec name so that several methods on the
    // same path get distinct, meaningful names (e.g. `TasksGetApi`,
    // `TasksPostApi`) instead of numeric suffixes.
    const { route, baseSpecName } = makeSpecNameFromRoute(
      file.pathComponents,
      ctx,
      { extraNameParts: [method] },
    );

    const specApi = spec.api(
      method,
      route,
      ctx.ref({
        importDefault: baseSpecName + "Api",
        from: file.absFilePath,
      }),
      hasAuthGroup(file.pathComponents) ? { auth: true } : undefined,
    );

    const claimedMethods = method === "ALL" ? HTTP_METHODS : [method];
    const claimedRoutes = claimedMethods.map(
      (method): RouteClaim => ({ type: "route", route, method }),
    );

    return {
      elements: [specApi],
      claims: [{ type: "file", path: file.absFilePath }, ...claimedRoutes],
    };
  },
};
