import * as spec from "@wasp.sh/spec";
import type { UnionToTuple } from "type-fest";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile } from "./options";
import { makeSpecNameFromRoute } from "./util";

const HTTP_METHODS_GLOB =
  "{" +
  (
    [
      "ALL",
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ] satisfies UnionToTuple<spec.HttpMethod>
  )
    .map((method) => method.toLowerCase())
    .join(",") +
  "}";

export const apiParser: Parser = {
  globs: [`**/${HTTP_METHODS_GLOB}.api` + ALLOWED_EXTENSIONS_GLOB],

  async parseFile(file, ctx) {
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

    return {
      elements: [specApi],
      claims: [
        { type: "file", path: file.absFilePath },
        { type: "route", route, method },
        ...(options?.claims ?? []),
      ],
    };
  },
};

/** Derives the HTTP method from an `<method>.api.<ext>` file name. */
export function apiMethodFromFileName(fileName: string): spec.HttpMethod {
  return fileName.split(".").at(0)!.toUpperCase() as spec.HttpMethod;
}
