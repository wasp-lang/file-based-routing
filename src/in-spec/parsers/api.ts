import * as spec from "@wasp.sh/spec";
import type { UnionToTuple } from "type-fest";
import * as z from "zod";
import type { RouteClaim } from "../claims";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile } from "./options";
import { makeSpecNameFromRoute } from "./util";

const HTTP_METHODS = [
  "ALL",
  "GET",
  "POST",
  "PUT",
  "DELETE",
] as const satisfies UnionToTuple<spec.HttpMethod>;

const HttpMethodsSchema = z.enum(HTTP_METHODS);

const HTTP_METHODS_GLOB =
  "{" + HTTP_METHODS.map((method) => method.toLowerCase()).join(",") + "}";

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

/** Derives the HTTP method from an `<method>.api.<ext>` file name. */
export function apiMethodFromFileName(fileName: string): spec.HttpMethod {
  return HttpMethodsSchema.parse(fileName.split(".").at(0)?.toUpperCase());
}
