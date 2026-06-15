import { describe, expect, it } from "vitest";
import { options } from "../index";

describe("options", () => {
  it("returns its input unchanged", () => {
    const opts = {
      page: { authRequired: true },
      route: { lazy: true },
    };

    expect(options(opts)).toBe(opts);
  });
});
