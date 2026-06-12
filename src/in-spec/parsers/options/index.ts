import * as $ from "@cprecioso/async-iterable-helpers";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as z from "zod";
import { RouteType } from "../../types";
import { ALLOWED_EXTENSIONS_GLOB } from "../common";
import { ALLOWED_KEYS_FOR_ROUTE_TYPE, FullOptionsSchema } from "./schema";

const OPTIONS_FILE_GLOB = "options" + ALLOWED_EXTENSIONS_GLOB;

export async function discoverOptionsForFile(
  absBaseFilePath: string,
  routeType: RouteType,
  { baseName }: { baseName?: string } = {},
) {
  const routeBaseDir = path.dirname(absBaseFilePath);

  const glob = (baseName ? `${baseName}.` : "") + OPTIONS_FILE_GLOB;

  const optionsFilePath = await $.from(
    fs.glob(glob, { cwd: routeBaseDir }),
  ).sink($.first());

  if (!optionsFilePath) {
    return undefined;
  }

  const absOptionsFilePath = path.resolve(routeBaseDir, optionsFilePath);

  return await importOptions(absOptionsFilePath, routeType);
}

export async function importOptions(
  absOptionsFilePath: string,
  routeType: RouteType,
) {
  const RouteOptionsSchema = FullOptionsSchema.pick(
    ALLOWED_KEYS_FOR_ROUTE_TYPE[routeType],
  ).strict();

  const FileExportsSchema = z.object({ default: RouteOptionsSchema });

  const { default: options } = FileExportsSchema.parse(
    await import(absOptionsFilePath),
  );

  return options;
}
