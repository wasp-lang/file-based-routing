import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import {
  ALLOWED_EXTENSIONS_GLOB,
  makeSpecNameFromPath,
} from "../common/route-path";
import { hasAuthGroup } from "./common";

export const queryParser: Parser = {
  // Recursive so `(auth)` route groups can nest queries (e.g.
  // `queries/(auth)/getTasks.ts`); the spec name still comes from the file name.
  globs: ["queries/**/*" + ALLOWED_EXTENSIONS_GLOB],
  claims: [{ type: "file", glob: "queries/**" }],

  async matchFile(file, ctx) {
    const { baseSpecName } = makeSpecNameFromPath(file.pathComponents, ctx);

    const specQuery = spec.query(
      ctx.ref({
        importDefault: baseSpecName + "Query",
        from: file.absFilePath,
      }),
      hasAuthGroup(file.pathComponents) ? { auth: true } : undefined,
    );

    return {
      elements: [specQuery],
      claims: [{ type: "file", path: file.absFilePath }],
    };
  },
};
