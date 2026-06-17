import * as spec from "@wasp.sh/spec";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { ClaimChecker } from "./in-spec/claims";
import { PARSER_BY_ROUTE_TYPE_ENTRIES } from "./in-spec/parsers";
import { specNameMaker } from "./in-spec/spec-name";

export async function fileBased({
  ref,
  baseDir = path.resolve(process.cwd(), "src/app"),
}: {
  ref: typeof spec.ref;
  baseDir?: string;
}): Promise<spec.SpecElement[]> {
  const makeUniqueSpecName = specNameMaker();

  const claimChecker = new ClaimChecker();

  const specElements = await asArray(async function* () {
    for (const [parserId, parser] of PARSER_BY_ROUTE_TYPE_ENTRIES) {
      await claimChecker.addClaims(parser.claims ?? [], { baseDir, parserId });

      // Sort glob results so the output, and the spec names assigned to files
      // whose names collide, don't depend on the filesystem's traversal order.
      const globResults = (
        await Array.fromAsync(fs.glob(parser.globs, { cwd: baseDir }))
      ).sort();

      for (const globResult of globResults) {
        const absPath = path.resolve(baseDir, globResult);
        const relPath = path.relative(baseDir, absPath);

        const pathComponents = relPath.split(path.sep);

        const parseResult = await parser.matchFile(
          { pathComponents, absFilePath: absPath },
          { ref, makeUniqueSpecName },
        );

        if (!parseResult) continue;

        await claimChecker.addClaims(parseResult.claims ?? [], {
          baseDir,
          parserId,
          matchedFile: absPath,
        });

        yield* parseResult.elements;
      }
    }
  });

  const claimErrors = claimChecker.getErrors();
  if (claimErrors.length > 0) {
    throw new AggregateError(claimErrors, "Conflicting claims detected");
  }

  return specElements;
}

function asArray<T>(asyncIterator: () => AsyncIterable<T>): Promise<T[]> {
  return Array.fromAsync(asyncIterator());
}
