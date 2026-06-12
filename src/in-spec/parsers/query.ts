import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";

export const queryParser: Parser = {
  globs: ["queries/*" + ALLOWED_EXTENSIONS_GLOB],

  async parseFile(file, ctx) {
    const fileName = file.pathComponents.at(-1)!;
    const baseSpecName = fileName.slice(0, fileName.lastIndexOf("."));

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
