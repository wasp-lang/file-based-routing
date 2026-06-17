import * as spec from "@wasp.sh/spec";

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

/**
 * Parsers or matchers can "claim" files or routes.
 *
 * That means that the plugin will error out if another parser also claims them.
 * This is used to prevent conflicts between different parsers or matchers that
 * may try to handle the same file or route.
 */
export type Claim =
  | { type: "file"; path: string }
  | { type: "file"; glob: string }
  | { type: "route"; route: string; method: spec.HttpMethod };
