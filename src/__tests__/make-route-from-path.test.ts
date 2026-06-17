import { describe, expect, it } from "vitest";
import { makeRouteFromPath } from "../in-spec/parsers/util";

describe("makeRouteFromPath", () => {
  it("derives the route from the directories leading to the file", () => {
    expect(makeRouteFromPath(["settings", "profile", "page.tsx"])).toBe(
      "/settings/profile",
    );
  });

  it("maps a top-level file to the root route", () => {
    expect(makeRouteFromPath(["page.tsx"])).toBe("/");
  });

  it("drops route group components wrapped in parentheses", () => {
    expect(
      makeRouteFromPath(["dashboard", "(logged-in)", "my-profile", "page.tsx"]),
    ).toBe("/dashboard/my-profile");
  });

  it("drops consecutive and nested route groups", () => {
    expect(
      makeRouteFromPath(["(marketing)", "(promos)", "pricing", "page.tsx"]),
    ).toBe("/pricing");
  });

  it("yields the root route when every directory is a route group", () => {
    expect(makeRouteFromPath(["(logged-in)", "page.tsx"])).toBe("/");
  });
});
