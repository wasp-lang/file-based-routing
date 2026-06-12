import * as $ from "@cprecioso/async-iterable-helpers";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as z from "zod";
import { FullOptionsSchema } from "../in-files/schema";
import type { FullOptions } from "../in-files/types";
import { ALLOWED_EXTENSIONS_GLOB } from "./parsers";
import { RouteType } from "./types";

export const ALLOWED_KEYS_FOR_ROUTE_TYPE: Record<
  RouteType,
  (keyof FullOptions)[]
> = {
  [RouteType.Page]: ["page", "route"],
  [RouteType.Api]: ["api"],
  [RouteType.ApiNamespace]: [],
};

const OPTIONS_FILE_GLOB = "options" + ALLOWED_EXTENSIONS_GLOB;

export async function discoverOptionsForFile(
  absBaseFilePath: string,
  routeType: RouteType,
) {
  const routeBaseDir = path.dirname(absBaseFilePath);

  const optionsFilePath = await $.from(
    fs.glob(OPTIONS_FILE_GLOB, { cwd: routeBaseDir }),
  ).sink($.last());

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
