import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import { ALLOWED_EXTENSIONS_GLOB, makeSpecNameFromPath } from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";

export const actionParser: Parser = {
  globs: ["actions/*" + ALLOWED_EXTENSIONS_GLOB],
  claims: [{ type: "file", glob: "actions/**" }],

  async matchFile(file, ctx) {
    if (isOptionsFile(file.absFilePath)) {
      return undefined;
    }

    const { baseSpecName, fileBaseName } = makeSpecNameFromPath(
      file.pathComponents,
      ctx,
      { casing: "camelCase" },
    );

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Action,
      { baseName: fileBaseName },
      ctx,
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
