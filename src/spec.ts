import * as spec from "@wasp.sh/spec";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { PARSERS_BY_ROUTE_TYPE } from "./in-spec/parsers";
import { specNameMaker } from "./in-spec/spec-name";

export async function fileBased({
  ref,
  baseDir = path.resolve(process.cwd(), "src/app"),
}: {
  ref: typeof spec.ref;
  baseDir?: string;
}): Promise<spec.SpecElement[]> {
  const makeUniqueSpecName = specNameMaker();

  return await Array.fromAsync(
    (async function* () {
      for (const parser of Object.values(PARSERS_BY_ROUTE_TYPE)) {
        // Sort glob results so the output, and the spec names assigned to files
        // whose names collide, don't depend on the filesystem's traversal order.
        const globResults = (
          await Array.fromAsync(fs.glob(parser.globs, { cwd: baseDir }))
        ).sort();

        for (const globResult of globResults) {
          const absPath = path.resolve(baseDir, globResult);
          const relPath = path.relative(baseDir, absPath);

          const pathComponents = relPath.split(path.sep);

          const parseResult = await parser.parseFile(
            { pathComponents, absFilePath: absPath },
            { ref, makeUniqueSpecName },
          );

          if (!parseResult) continue;

          yield* parseResult.elements;
        }
      }
    })(),
  );
}
