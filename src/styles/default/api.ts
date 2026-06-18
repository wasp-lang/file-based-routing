import * as spec from "@wasp.sh/spec";
import type { RouteClaim } from "../../in-spec/claims";
import type { Parser } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import {
  apiMethodFromFileName,
  HTTP_METHODS,
  HTTP_METHODS_GLOB,
} from "../common/http-methods";
import {
  ALLOWED_EXTENSIONS_GLOB,
  makeSpecNameFromRoute,
} from "../common/route-path";
import { discoverOptionsForFile } from "./options";

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

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Api,
      { baseName: `api.${method.toLowerCase()}` },
    );

    const specApi = spec.api(
      method,
      route,
      ctx.ref({
        importDefault: baseSpecName + "Api",
        from: file.absFilePath,
      }),
      options?.value.api,
    );

    const claimedMethods = method === "ALL" ? HTTP_METHODS : [method];
    const claimedRoutes = claimedMethods.map(
      (method): RouteClaim => ({ type: "route", route, method }),
    );

    return {
      elements: [specApi],
      claims: [
        { type: "file", path: file.absFilePath },
        ...claimedRoutes,
        ...(options?.claims ?? []),
      ],
    };
  },
};
