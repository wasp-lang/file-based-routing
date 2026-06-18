import { describe, expect, it } from "vitest";
import { isOptionsFile } from "../options";

describe("isOptionsFile", () => {
  it("matches bare `options.*` files", () => {
    expect(isOptionsFile("/project/src/queries/options.ts")).toBe(true);
  });

  it("matches `<baseName>.options.*` files", () => {
    expect(isOptionsFile("/project/src/queries/getTasks.options.ts")).toBe(
      true,
    );
  });

  it("does not match regular operation files", () => {
    expect(isOptionsFile("/project/src/queries/getTasks.ts")).toBe(false);
  });

  it("matches options files under dot-prefixed ancestor directories", () => {
    // `**` does not traverse a `.`-prefixed segment, so matching against the
    // full path broke for layouts like Conductor workspaces or git worktrees.
    expect(
      isOptionsFile("/home/user/.conductor/ws/src/queries/getTasks.options.ts"),
    ).toBe(true);
    expect(
      isOptionsFile("/home/user/.worktrees/feat/src/queries/options.ts"),
    ).toBe(true);
  });
});
