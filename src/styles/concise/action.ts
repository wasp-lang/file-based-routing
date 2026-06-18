import * as spec from "@wasp.sh/spec";
import type { Parser } from "../../in-spec/parsers/common";
import {
  ALLOWED_EXTENSIONS_GLOB,
  isNestedOnlyInRouteGroups,
  makeSpecNameFromPath,
} from "../common/route-path";
import { hasAuthGroup } from "./common";

export const actionParser: Parser = {
  // Recursive so route groups like `(auth)` can nest actions (e.g.
  // `actions/(auth)/createTask.ts`); the spec name still comes from the file name.
  globs: ["actions/**/*" + ALLOWED_EXTENSIONS_GLOB],
  claims: [{ type: "file", glob: "actions/**" }],

  async matchFile(file, ctx) {
    if (!isNestedOnlyInRouteGroups(file.pathComponents)) {
      return { elements: [] };
    }

    const { baseSpecName } = makeSpecNameFromPath(file.pathComponents, ctx);

    const specAction = spec.action(
      ctx.ref({
        importDefault: baseSpecName + "Action",
        from: file.absFilePath,
      }),
      hasAuthGroup(file.pathComponents) ? { auth: true } : undefined,
    );

    return {
      elements: [specAction],
      claims: [{ type: "file", path: file.absFilePath }],
    };
  },
};
