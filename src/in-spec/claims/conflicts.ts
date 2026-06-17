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
  const formatContext = makeContextFormatter(baseDir, conflict.type !== "file");

  switch (conflict.type) {
    case "file":
      return `File "${path.relative(baseDir, conflict.value)}" can be interpreted as either a ${formatContext(conflict.existing)} or a ${formatContext(conflict.conflicting)}.`;
    case "route":
      return `Route "${conflict.value}" can be generated from either a ${formatContext(conflict.existing)} or a ${formatContext(conflict.conflicting)}.`;
  }
}

function makeContextFormatter(baseDir: string, showFilePaths: boolean) {
  return (context: Context) =>
    `"${context.parserId}" spec` +
    (showFilePaths && context.matchedFile
      ? ` (from "${path.relative(baseDir, context.matchedFile)}")`
      : "");
}
