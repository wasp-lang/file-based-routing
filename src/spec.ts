import * as $ from "@cprecioso/async-iterable-helpers";
import * as spec from "@wasp.sh/spec";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { PARSERS_BY_ROUTE_TYPE } from "./in-spec/parsers";
import { specNameMaker } from "./in-spec/spec-name";

export const fileBased = async ({
  ref,
  baseDir,
}: {
  ref: typeof spec.ref;
  baseDir?: string;
}): Promise<spec.SpecElement[]> => {
  baseDir ??= path.resolve(process.cwd(), "src/app");

  const makeUniqueSpecName = specNameMaker();

  return await $.concatAll(
    Object.values(PARSERS_BY_ROUTE_TYPE).map((parser) => {
      return $.from(fs.glob(parser.globs, { cwd: baseDir })).pipe(
        $.flatMap((globResult) => {
          const absPath = path.resolve(baseDir, globResult);
          const relPath = path.relative(baseDir, absPath);

          const pathComponents = relPath.split(path.sep);

          return parser.parseFile(
            { pathComponents, absFilePath: absPath },
            { ref, makeUniqueSpecName },
          );
        }),
      );
    }),
  ).sink($.toArray());
};
