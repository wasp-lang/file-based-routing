import { fromPartial } from "@total-typescript/shoehorn";
import { describe, expect, it } from "vitest";
import type { ParserContext } from "../../../in-spec/parsers/common";
import { specNameMaker } from "../../../in-spec/spec-name";
import { makeSpecNameFromPath } from "../route-path";

function makeCtx(): ParserContext {
  return fromPartial({ makeUniqueSpecName: specNameMaker() });
}

describe("makeSpecNameFromPath", () => {
  it("returns the original file base name alongside the pascal-cased spec name", () => {
    const { baseSpecName, fileBaseName } = makeSpecNameFromPath(
      ["queries", "getTasks.ts"],
      makeCtx(),
    );

    // `fileBaseName` keeps the on-disk name so sibling files (e.g. options)
    // can be discovered by their real name.
    expect(fileBaseName).toBe("getTasks");
    // `baseSpecName` is pascal-cased for use as a spec identifier.
    expect(baseSpecName).toBe("GetTasks");
  });

  it("keeps the original file base name when it diverges from the spec name beyond casing", () => {
    const { baseSpecName, fileBaseName } = makeSpecNameFromPath(
      ["queries", "get-tasks.ts"],
      makeCtx(),
    );

    expect(fileBaseName).toBe("get-tasks");
    expect(baseSpecName).toBe("GetTasks");
  });

  it("strips only the final extension", () => {
    const { fileBaseName } = makeSpecNameFromPath(
      ["queries", "getTasks.options.ts"],
      makeCtx(),
    );

    expect(fileBaseName).toBe("getTasks.options");
  });

  it("folds extra name parts into the spec name only", () => {
    const { baseSpecName, fileBaseName } = makeSpecNameFromPath(
      ["apis", "webhook.ts"],
      makeCtx(),
      { extraNameParts: ["POST"] },
    );

    expect(fileBaseName).toBe("webhook");
    expect(baseSpecName).toBe("WebhookPost");
  });

  it("counter-suffixes the spec name on collision but leaves the file base name intact", () => {
    const ctx = makeCtx();

    const first = makeSpecNameFromPath(["queries", "getTasks.ts"], ctx);
    const second = makeSpecNameFromPath(
      ["queries", "archived", "getTasks.ts"],
      ctx,
    );

    expect(first.baseSpecName).toBe("GetTasks");
    expect(second.baseSpecName).toBe("GetTasks1");
    // Both files keep their real base name even though the spec name was
    // de-duplicated.
    expect(first.fileBaseName).toBe("getTasks");
    expect(second.fileBaseName).toBe("getTasks");
  });
});
