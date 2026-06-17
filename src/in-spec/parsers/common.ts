import type * as spec from "@wasp.sh/spec";
import type { Claim } from "../claims";

export const ALLOWED_EXTENSIONS_GLOB = ".{m,c,}{t,j}s{,x}";

export interface Parser {
  globs: readonly string[];
  claims?: readonly Claim[];
  matchFile: (
    file: ParserFile,
    ctx: ParserContext,
  ) => Promise<ParseResult | undefined>;
}

export interface ParserFile {
  pathComponents: readonly string[];
  absFilePath: string;
}

export interface ParserContext {
  ref: typeof spec.ref;
  makeUniqueSpecName: (base: string) => string;
}

export interface ParseResult {
  elements: spec.SpecElement[];
  claims?: readonly Claim[];
}
