import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import { RouteType } from "../../in-spec/types";
import {
  ALLOWED_EXTENSIONS_GLOB,
  isNestedOnlyInRouteGroups,
  makeSpecNameFromPath,
} from "../common/route-path";
import { discoverOptionsForFile, isOptionsFile } from "./options";

export const jobParser: Parser = {
  // Recursive so jobs can be organized under route groups (e.g.
  // `jobs/(internal)/sendDigest.ts`); the spec name still comes from the file name.
  globs: ["jobs/**/*" + ALLOWED_EXTENSIONS_GLOB],
  claims: [{ type: "file", glob: "jobs/**" }],

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
      RouteType.Job,
      { baseName: fileBaseName },
    );

    const specJob = spec.job(
      ctx.ref({
        importDefault: baseSpecName + "Job",
        from: file.absFilePath,
      }),
      { executor: "PgBoss", ...options?.value.job },
    );

    return {
      elements: [specJob],
      claims: [
        { type: "file", path: file.absFilePath },
        ...(options?.claims ?? []),
      ],
    };
  },
};
