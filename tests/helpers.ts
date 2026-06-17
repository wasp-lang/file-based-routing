import { fromPartial } from "@total-typescript/shoehorn";
import type * as spec from "@wasp.sh/spec";
import * as path from "node:path";

/** A `spec.ref` stand-in that records its normalized arguments instead of importing. */
export function makeRef(baseDir: string): typeof spec.ref {
  return (descriptor) =>
    fromPartial({
      kind: "refObject",
      ...descriptor,
      from: path.relative(baseDir, descriptor.from),
    });
}
