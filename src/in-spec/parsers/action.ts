import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";
import { makeSpecNameFromPath } from "./util";

export const actionParser: Parser = {
  globs: ["actions/*" + ALLOWED_EXTENSIONS_GLOB],

  async matchFile(file, ctx) {
    const { baseSpecName } = makeSpecNameFromPath(file.pathComponents, ctx);

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
