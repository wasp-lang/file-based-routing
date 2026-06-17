import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";
import { makeSpecNameFromPath } from "./util";

export const actionParser: Parser = {
  globs: ["actions/*" + ALLOWED_EXTENSIONS_GLOB],
  claims: [{ type: "file", glob: "actions/**" }],

  async matchFile(file, ctx) {
    if (isOptionsFile(file.absFilePath)) {
      return undefined;
    }

    const { baseSpecName } = makeSpecNameFromPath(file.pathComponents, ctx);

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
      options?.value.action,
    );

    return {
      elements: [specAction],
      claims: [
        { type: "file", path: file.absFilePath },
        ...(options?.claims ?? []),
      ],
    };
  },
};
