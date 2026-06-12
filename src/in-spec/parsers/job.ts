import * as spec from "@wasp.sh/spec";
import { RouteType } from "../types";
import { ALLOWED_EXTENSIONS_GLOB, type Parser } from "./common";
import { discoverOptionsForFile, isOptionsFile } from "./options";

export const jobParser: Parser = {
  globs: ["jobs/*" + ALLOWED_EXTENSIONS_GLOB],

  async parseFile(file, ctx) {
    const fileName = file.pathComponents.at(-1)!;
    const baseSpecName = fileName.slice(0, fileName.lastIndexOf("."));

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
