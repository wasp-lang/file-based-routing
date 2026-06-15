import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { fileBased } from "../src/spec";
import { makeRef, normalizeForGolden } from "./helpers";

const TREES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "trees",
);

// Set `UPDATE_GOLDEN=1` to regenerate every `output.json` from the current
// parser output. See `npm run test:update`.
const UPDATE = !!process.env.UPDATE_GOLDEN;

/** The shape of a tree's `output.json`. */
interface Golden {
  /** Human-readable name for the case, used as the test title. */
  description: string;
  /**
   * If set, the parser is expected to reject with an error message containing
   * this substring, and `elements` is omitted.
   */
  throws?: string;
  /**
   * If set, `baseDir` is left unset and `process.cwd()` is mocked to this path
   * (relative to `input/`), exercising the default base directory.
   */
  cwd?: string;
  /** The expected, normalized `fileBased` result. */
  elements?: unknown;
}

const trees = fs
  .readdirSync(TREES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

describe("file-based routing trees", () => {
  for (const tree of trees) {
    const treeDir = path.join(TREES_DIR, tree);
    const inputDir = path.join(treeDir, "input");
    const goldenPath = path.join(treeDir, "output.json");

    const golden: Golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));

    it(`${tree}: ${golden.description}`, async () => {
      if (golden.throws !== undefined) {
        await expect(
          fileBased({ ref: makeRef(), baseDir: inputDir }),
        ).rejects.toThrow(golden.throws);
        return;
      }

      const result = await run(golden, inputDir);
      const elements = normalizeForGolden(result, inputDir);

      if (UPDATE) {
        await fsp.writeFile(
          goldenPath,
          JSON.stringify({ ...golden, elements }, null, 2) + "\n",
        );
        return;
      }

      expect(elements).toEqual(golden.elements);
    });
  }
});

function run(golden: Golden, inputDir: string) {
  if (golden.cwd === undefined) {
    return fileBased({ ref: makeRef(), baseDir: inputDir });
  }

  const cwdSpy = vi
    .spyOn(process, "cwd")
    .mockReturnValue(path.join(inputDir, golden.cwd));
  try {
    return fileBased({ ref: makeRef() });
  } finally {
    cwdSpy.mockRestore();
  }
}
