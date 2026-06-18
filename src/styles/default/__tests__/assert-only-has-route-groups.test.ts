import { describe, expect, it } from "vitest";
import { assertOnlyHasRouteGroups } from "../common";

describe("assertOnlyHasRouteGroups", () => {
  it("accepts a file directly inside the reserved directory", () => {
    expect(() =>
      assertOnlyHasRouteGroups(["queries", "getTasks.ts"]),
    ).not.toThrow();
  });

  it("accepts a file nested inside a route group", () => {
    expect(() =>
      assertOnlyHasRouteGroups(["queries", "(admin)", "getUsers.ts"]),
    ).not.toThrow();
  });

  it("accepts a file nested inside several route groups", () => {
    expect(() =>
      assertOnlyHasRouteGroups(["actions", "(admin)", "(super)", "banUser.ts"]),
    ).not.toThrow();
  });

  it("throws for a file nested inside a non-group directory", () => {
    expect(() =>
      assertOnlyHasRouteGroups(["queries", "nested", "deep.ts"]),
    ).toThrow(/route group/);
  });

  it("throws when only some intermediate directories are route groups", () => {
    expect(() =>
      assertOnlyHasRouteGroups(["queries", "(admin)", "sub", "deep.ts"]),
    ).toThrow(/route group/);
  });
});
