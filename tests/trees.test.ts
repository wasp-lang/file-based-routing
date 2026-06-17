import * as fs from "node:fs/promises";
import * as path from "node:path";
import { it, suite } from "vitest";
import { fileBased } from "../src/spec";
import { makeRef } from "./helpers";

const TREES_FOLDER = path.join(import.meta.dirname, "trees");

suite("test trees", async () => {
  const dirs = await fs.readdir(TREES_FOLDER);

  const testCases = await Promise.all(
    dirs.map(async (dir) => {
      const descriptionPath = path.join(TREES_FOLDER, dir, "description.txt");
      const description = (await fs.readFile(descriptionPath, "utf-8")).trim();

      return [dir, description] as const;
    }),
  );

  it.for(testCases)("%s: %s", async ([testDirName], { expect }) => {
    const testDir = path.join(TREES_FOLDER, testDirName);
    const snapshotPath = path.join(testDir, "output.json");
    const inputDir = path.join(testDir, "input");

    const ref = makeRef(inputDir);

    const fileBasedResult = fileBased({ ref, baseDir: inputDir });

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
