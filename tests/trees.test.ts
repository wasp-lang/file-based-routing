import * as fs from "node:fs/promises";
import * as path from "node:path";
import { it, suite } from "vitest";
import type { Style } from "../src/in-spec/parsers/common";
import { fileBased } from "../src/spec";
import { defaultStyle } from "../src/styles/default";
import { makeRef } from "./helpers";

const TREES_FOLDER = path.join(import.meta.dirname, "trees");

/** Each style has its own set of test trees, scoped under `trees/<style>/`. */
const STYLES: Record<string, Style> = {
  default: defaultStyle,
};

suite.for(Object.entries(STYLES))("style %s", async ([styleName, style]) => {
  const styleFolder = path.join(TREES_FOLDER, styleName);
  const dirs = await fs.readdir(styleFolder);

  const testCases = await Promise.all(
    dirs.map(async (dir) => {
      const descriptionPath = path.join(styleFolder, dir, "description.txt");
      const description = (await fs.readFile(descriptionPath, "utf-8")).trim();

      return [dir, description] as const;
    }),
  );

  it.for(testCases)("%s: %s", async ([testDirName], { expect }) => {
    const testDir = path.join(styleFolder, testDirName);
    const snapshotPath = path.join(testDir, "output.json");
    const inputDir = path.join(testDir, "input");

    const ref = makeRef(inputDir);
    const fileBasedResult = fileBased({ ref, baseDir: inputDir, style });

    const snapshotContent = await fileBasedResult
      .then(
        (result) => ({ type: "success", result }),
        (error) => ({ type: "error", error: serializeError(error) }),
      )
      .then((result) => JSON.stringify(result, null, 2) + "\n");

    await expect(snapshotContent).toMatchFileSnapshot(snapshotPath, "output");
  });
});

function serializeError(error: unknown): unknown {
  if (!(error instanceof Error)) return String(error);
  return {
    name: error.name,
    message: error.message,
    ...(error.cause !== undefined && { cause: serializeError(error.cause) }),
  };
}
