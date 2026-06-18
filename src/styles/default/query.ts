import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import {
  ALLOWED_EXTENSIONS_GLOB,
  isNestedOnlyInRouteGroups,
  makeSpecNameFromPath,
} from "../common/route-path";
import { discoverOptionsForFile, isOptionsFile } from "./options";

export const queryParser: Parser = {
  // Recursive so queries can be organized under route groups (e.g.
  // `queries/(internal)/getTasks.ts`); the spec name still comes from the file name.
  globs: ["queries/**/*" + ALLOWED_EXTENSIONS_GLOB],
  claims: [{ type: "file", glob: "queries/**" }],

  async matchFile(file, ctx) {
    if (
      isOptionsFile(file.absFilePath) ||
      !isNestedOnlyInRouteGroups(file.pathComponents)
    ) {
      return { elements: [] };
    }

    const { baseSpecName, fileBaseName } = makeSpecNameFromPath(
      file.pathComponents,
      ctx,
    );

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Query,
      { baseName: fileBaseName },
    );

    const specQuery = spec.query(
      ctx.ref({
        importDefault: baseSpecName + "Query",
        from: file.absFilePath,
      }),
      options?.value.query,
    );

    return {
      elements: [specQuery],
      claims: [
        { type: "file", path: file.absFilePath },
        ...(options?.claims ?? []),
      ],
    };
  },
};
