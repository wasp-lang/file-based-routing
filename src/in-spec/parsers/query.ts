import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";
import { makeSpecNameFromPath } from "./util";

export const queryParser: Parser = {
  globs: ["queries/*" + ALLOWED_EXTENSIONS_GLOB],

  async matchFile(file, ctx) {
    const { baseSpecName } = makeSpecNameFromPath(file.pathComponents, ctx);

    if (isOptionsFile(file.absFilePath)) {
      return [];
    }

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Query,
      { baseName: baseSpecName },
    );

    const specQuery = spec.query(
      ctx.ref({
        importDefault: baseSpecName + "Query",
        from: file.absFilePath,
      }),
      options?.query,
    );

    return [specQuery];
  },
};
