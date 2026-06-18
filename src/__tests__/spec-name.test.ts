import { describe, expect, it } from "vitest";
import { specNameMaker } from "../in-spec/spec-name";

describe("specNameMaker", () => {
  it("pascal-cases the base name", () => {
    const make = specNameMaker();

    expect(make("/my-page", "PascalCase")).toBe("MyPage");
    expect(make("/settings/profile", "PascalCase")).toBe("SettingsProfile");
  });

  it("camel-cases the base name when requested", () => {
    const make = specNameMaker();

    expect(make("/my-page", "camelCase")).toBe("myPage");
    expect(make("/settings/profile", "camelCase")).toBe("settingsProfile");
  });

  it("deburrs non-ASCII characters", () => {
    const make = specNameMaker();

    expect(make("/crème-brûlée", "PascalCase")).toBe("CremeBrulee");
  });

  it("strips route syntax characters", () => {
    const make = specNameMaker();

    expect(make("/docs/:lang?", "PascalCase")).toBe("DocsLang");
    expect(make("/files/*", "PascalCase")).toBe("Files");
  });

  it("appends counters to already-used names", () => {
    const make = specNameMaker();

    expect(make("/foo", "PascalCase")).toBe("Foo");
    expect(make("foo", "PascalCase")).toBe("Foo1");
    expect(make("FOO", "PascalCase")).toBe("Foo2");
  });
});
