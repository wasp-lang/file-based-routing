import * as spec from "@wasp.sh/spec";

export const ALLOWED_EXTENSIONS_GLOB = ".{m,c,}{t,j}s{,x}";

export interface Parser {
  globs: readonly string[];
  parseFile: (
    file: ParserFile,
    ctx: ParserContext,
  ) => Promise<spec.SpecElement[]>;
}

export interface ParserFile {
  pathComponents: readonly string[];
  absFilePath: string;
}

export interface ParserContext {
  ref: typeof spec.ref;
  makeUniqueSpecName: (base: string) => string;
}
