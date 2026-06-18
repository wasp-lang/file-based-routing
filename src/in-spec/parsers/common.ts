import type * as spec from "@wasp.sh/spec";
import type { Claim } from "../claims";
import type { SpecNameCasing } from "../spec-name";
import type { RouteType } from "../types";

export interface Parser {
  globs: readonly string[];
  claims?: readonly Claim[];
  matchFile: (
    file: ParserFile,
    ctx: ParserContext,
  ) => Promise<ParseResult | undefined>;
}

/**
 * A style is a named set of parsers that, together, define a convention for
 * deriving spec elements from a file layout. Swap one style for another to use
 * a different set of file-based routing conventions.
 */
export interface Style {
  parsers: Partial<Record<RouteType, Parser>>;
}

export interface ParserFile {
  pathComponents: readonly string[];
  absFilePath: string;
}

export interface ParserContext {
  ref: typeof spec.ref;
  makeUniqueSpecName: (base: string, casing: SpecNameCasing) => string;
}

export interface ParseResult {
  elements: spec.SpecElement[];
  claims?: readonly Claim[];
}
