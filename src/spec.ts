import * as spec from "@wasp.sh/spec";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { ClaimChecker } from "./in-spec/claims/checker";
import { formatConflict } from "./in-spec/claims/conflicts";
import type { Parser, Style } from "./in-spec/parsers/common";
import type { RouteType } from "./in-spec/types";
import { specNameMaker } from "./in-spec/spec-name";
import { defaultStyle } from "./styles/default";

export async function fileBased({
  ref,
  baseDir = path.resolve(process.cwd(), "src/app"),
  style = defaultStyle,
}: {
  ref: typeof spec.ref;
  baseDir?: string;
  style?: Style;
}): Promise<spec.SpecElement[]> {
  const makeUniqueSpecName = specNameMaker();

  const claimChecker = new ClaimChecker();

  const specElements = await asArray(async function* () {
    for (const [parserId, parser] of Object.entries(style) as [
      RouteType,
      Parser,
    ][]) {
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

        let parseResult;
        try {
          parseResult = await parser.matchFile(
            { pathComponents, absFilePath: absPath },
            { ref, makeUniqueSpecName },
          );
        } catch (cause) {
          throw new Error(`Error while parsing file "${relPath}"`, { cause });
        }

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

  const conflicts = claimChecker.getConflicts();
  if (conflicts.length > 0) {
    throw new Error(
      `Conflicting files detected:\n${conflicts
        .map((conflict) => "  - " + formatConflict(conflict, baseDir))
        .join("\n")}`,
    );
  }

  return specElements;
}

function asArray<T>(asyncIterator: () => AsyncIterable<T>): Promise<T[]> {
  return Array.fromAsync(asyncIterator());
}
