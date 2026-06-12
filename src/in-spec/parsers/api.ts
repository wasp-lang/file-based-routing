import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile } from "./options";
import { computeRoute } from "./util";

export const apiParser: Parser = {
  globs: ["**/*.api" + ALLOWED_EXTENSIONS_GLOB],

  async parseFile(file, ctx) {
    const { route, baseSpecName } = computeRoute(file, ctx);

    const method = file.pathComponents
      .at(-1)
      ?.split(".")
      .at(0)
      ?.toUpperCase() as spec.HttpMethod;

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
