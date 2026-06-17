import * as path from "node:path";
import type { Context } from "./checker";

export interface Conflict {
  type: "file" | "route";
  value: string;
  existing: Context;
  conflicting: Context;
}

export function conflictIsCompatible({
  existing,
  conflicting,
}: Conflict): boolean {
  return (
    existing.parserId === conflicting.parserId &&
    (!existing.matchedFile || existing.matchedFile === conflicting.matchedFile)
  );
}

export function formatConflict(conflict: Conflict, baseDir: string): string {
  if (conflict.type === "file") {
    return `File "${conflict.value}" can be interpreted as either a "${conflict.existing.parserId}" or a "${conflict.conflicting.parserId}".`;
  } else {
    if (conflict.existing.parserId !== conflict.conflicting.parserId) {
      return `Route "${conflict.value}" can be interpreted as either a "${conflict.existing.parserId}" or a "${conflict.conflicting.parserId}".`;
    } else {
      const existingFile = conflict.existing.matchedFile
        ? path.relative(baseDir, conflict.existing.matchedFile)
        : `a ${conflict.existing.parserId}`;

      const conflictingFile = conflict.conflicting.matchedFile
        ? path.relative(baseDir, conflict.conflicting.matchedFile)
        : `a ${conflict.conflicting.parserId}`;

      return `Route "${conflict.value}" can be generated from either "${existingFile}" or "${conflictingFile}".`;
    }
  }
}
