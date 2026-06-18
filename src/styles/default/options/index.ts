import type * as spec from "@wasp.sh/spec";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { FullOptions } from "../../../in-files/types";
import type { Claim } from "../../../in-spec/claims";
import type { ParserContext } from "../../../in-spec/parsers/common";
import type { RouteType } from "../../../in-spec/types";
import { ALLOWED_EXTENSIONS_GLOB } from "../common";
import { loadOptionsFileDefaultExport } from "./load-options-file";
import { ALLOWED_KEYS_FOR_ROUTE_TYPE, FullOptionsSchema } from "./schema";

const OPTIONS_FILE_GLOB = "options" + ALLOWED_EXTENSIONS_GLOB;

export async function discoverOptionsForFile(
  absBaseFilePath: string,
  routeType: RouteType,
  { baseName }: { baseName: string },
  ctx: Pick<ParserContext, "ref">,
): Promise<
  { value: Partial<FullOptions>; claims: readonly Claim[] } | undefined
> {
  const routeBaseDir = path.dirname(absBaseFilePath);

  const glob = makeOptionsGlob(baseName);

  const optionsFilePath = (
    await Array.fromAsync(fs.glob(glob, { cwd: routeBaseDir }))
  ).at(0);

  if (!optionsFilePath) {
    return undefined;
  }

  const absOptionsFilePath = path.resolve(routeBaseDir, optionsFilePath);

  return {
    value: await importOptions(absOptionsFilePath, routeType, ctx.ref),
    claims: [{ type: "file", path: absOptionsFilePath }],
  };
}

export function isOptionsFile(filePath: string) {
  // Matches both bare `options.*` files and `<baseName>.options.*` files.
  // Match against the basename so dot-prefixed ancestor directories (e.g.
  // `.conductor`, `.worktrees`), which `**` does not traverse, don't break it.
  return path.matchesGlob(path.basename(filePath), "{,*.}" + OPTIONS_FILE_GLOB);
}

function makeOptionsGlob(baseName = "") {
  return (baseName ? `${baseName}.` : "") + OPTIONS_FILE_GLOB;
}

export async function importOptions(
  absOptionsFilePath: string,
  routeType: RouteType,
  ref: typeof spec.ref,
) {
  const RouteOptionsSchema = FullOptionsSchema.pick(
    ALLOWED_KEYS_FOR_ROUTE_TYPE[routeType],
  ).strict();

  return RouteOptionsSchema.parse(
    await loadOptionsFileDefaultExport(absOptionsFilePath, ref),
  );
}
