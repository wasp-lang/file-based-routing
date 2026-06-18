import { describe, expect, it } from "vitest";
import { isReachableThroughRouteGroups } from "../common";

describe("isReachableThroughRouteGroups", () => {
  it("accepts a file directly inside the reserved directory", () => {
    expect(isReachableThroughRouteGroups(["queries", "getTasks.ts"])).toBe(
      true,
    );
  });

  it("accepts a file nested inside a route group", () => {
    expect(
      isReachableThroughRouteGroups(["queries", "(admin)", "getUsers.ts"]),
    ).toBe(true);
  });

  it("accepts a file nested inside several route groups", () => {
    expect(
      isReachableThroughRouteGroups([
        "actions",
        "(admin)",
        "(super)",
        "banUser.ts",
      ]),
    ).toBe(true);
  });

  it("rejects a file nested inside a non-group directory", () => {
    expect(
      isReachableThroughRouteGroups(["queries", "nested", "deep.ts"]),
    ).toBe(false);
  });

  it("rejects a file when any intermediate directory is not a route group", () => {
    expect(
      isReachableThroughRouteGroups(["queries", "(admin)", "sub", "deep.ts"]),
    ).toBe(false);
  });
});
