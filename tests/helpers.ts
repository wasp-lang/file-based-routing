import type * as spec from "@wasp.sh/spec";
import * as path from "node:path";

/** A `spec.ref` stand-in that records its arguments instead of importing. */
export function makeRef() {
  return ((...args: unknown[]) =>
    ({ kind: "ref-call", args }) as never) as typeof spec.ref;
}

/**
 * Turns a `fileBased` result into a stable, machine-comparable shape:
 *
 * - absolute `from` paths are rewritten relative to `inputDir`, with POSIX
 *   separators, so the golden file is portable across machines, and
 * - every string is NFC-normalized, so filesystems that report names in NFD
 *   form (e.g. macOS) don't change the snapshot.
 */
export function normalizeForGolden(value: unknown, inputDir: string): unknown {
  if (typeof value === "string") {
    return relativizePath(value, inputDir).normalize("NFC");
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeForGolden(item, inputDir));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        normalizeForGolden(val, inputDir),
      ]),
    );
  }

  return value;
}

function relativizePath(value: string, inputDir: string): string {
  if (!value.startsWith(inputDir + path.sep)) return value;
  return path.relative(inputDir, value).split(path.sep).join("/");
}
