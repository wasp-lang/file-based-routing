import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";

export const actionParser: Parser = {
  globs: ["actions/*" + ALLOWED_EXTENSIONS_GLOB],

  async parseFile(file, ctx) {
    const fileName = file.pathComponents.at(-1)!;
    const baseSpecName = fileName.slice(0, fileName.lastIndexOf("."));

    if (isOptionsFile(file.absFilePath)) {
      return [];
    }

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Action,
      { baseName: baseSpecName },
    );

    const specAction = spec.action(
      ctx.ref({
        importDefault: baseSpecName + "Action",
        from: file.absFilePath,
      }),
      options?.action,
    );

    return [specAction];
  },
};
