import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import {
  ALLOWED_EXTENSIONS_GLOB,
  isNestedOnlyInRouteGroups,
  makeSpecNameFromPath,
} from "../common/route-path";
import { discoverOptionsForFile, isOptionsFile } from "./options";

export const actionParser: Parser = {
  // Recursive so actions can be organized under route groups (e.g.
  // `actions/(internal)/createTask.ts`); the spec name still comes from the file name.
  globs: ["actions/**/*" + ALLOWED_EXTENSIONS_GLOB],
  claims: [{ type: "file", glob: "actions/**" }],

  async matchFile(file, ctx) {
    if (
      isOptionsFile(file.absFilePath) ||
      !isNestedOnlyInRouteGroups(file.pathComponents)
    ) {
      return undefined;
    }

    const { baseSpecName, fileBaseName } = makeSpecNameFromPath(
      file.pathComponents,
      ctx,
    );

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Action,
      { baseName: fileBaseName },
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
