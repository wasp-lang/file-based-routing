import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile } from "./options";
import { apiMethodFromFileName, makeSpecNameFromRoute } from "./util";

export const apiParser: Parser = {
  globs: ["**/*.api" + ALLOWED_EXTENSIONS_GLOB],

  async matchFile(file, ctx) {
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
      options?.api,
    );

    return [specApi];
  },
};
