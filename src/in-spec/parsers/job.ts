import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";
import { makeSpecNameFromPath } from "./util";

export const jobParser: Parser = {
  globs: ["jobs/*" + ALLOWED_EXTENSIONS_GLOB],

  async matchFile(file, ctx) {
    const { baseSpecName } = makeSpecNameFromPath(file.pathComponents, ctx);

    if (isOptionsFile(file.absFilePath)) {
      return [];
    }

    const options = await discoverOptionsForFile(
      file.absFilePath,
      RouteType.Job,
      { baseName: baseSpecName },
    );

    const specJob = spec.job(
      ctx.ref({
        importDefault: baseSpecName + "Job",
        from: file.absFilePath,
      }),
      { executor: "PgBoss", ...options?.job },
    );

    return [specJob];
  },
};
