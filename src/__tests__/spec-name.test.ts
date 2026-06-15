import { describe, expect, it } from "vitest";
import { specNameMaker } from "../in-spec/spec-name";

describe("specNameMaker", () => {
  it("pascal-cases the base name", () => {
    const make = specNameMaker();

    expect(make("/my-page")).toBe("MyPage");
    expect(make("/settings/profile")).toBe("SettingsProfile");
  });

  it("deburrs non-ASCII characters", () => {
    const make = specNameMaker();

    expect(make("/crème-brûlée")).toBe("CremeBrulee");
  });

  it("strips route syntax characters", () => {
    const make = specNameMaker();

    expect(make("/docs/:lang?")).toBe("DocsLang");
    expect(make("/files/*")).toBe("Files");
  });

  it("appends counters to already-used names", () => {
    const make = specNameMaker();

    expect(make("/foo")).toBe("Foo");
    expect(make("foo")).toBe("Foo1");
    expect(make("FOO")).toBe("Foo2");
  });
});
