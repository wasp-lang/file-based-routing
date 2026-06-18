import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import {
  ALLOWED_EXTENSIONS_GLOB,
  assertOnlyHasRouteGroups,
  makeSpecNameFromPath,
} from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";

export const queryParser: Parser = {
  globs: ["queries/**/*" + ALLOWED_EXTENSIONS_GLOB],
  claims: [{ type: "file", glob: "queries/**" }],

  async matchFile(file, ctx) {
    if (isOptionsFile(file.absFilePath)) {
      return { elements: [] };
    }

    assertOnlyHasRouteGroups(file.pathComponents);

    const { baseSpecName, fileBaseName } = makeSpecNameFromPath(
      file.pathComponents,
      ctx,
      { casing: "camelCase" },
    );

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Query,
      { baseName: fileBaseName },
    );

    const specQuery = spec.query(
      ctx.ref({
        importDefault: baseSpecName,
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
