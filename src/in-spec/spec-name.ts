import * as _ from "es-toolkit";

export type SpecNameCasing = "PascalCase" | "camelCase";

export function specNameMaker() {
  const usedNames = new Set<string>();

  return (base: string, casing: SpecNameCasing) => {
    const recaseFn = casing === "camelCase" ? _.camelCase : _.pascalCase;
    const normalizedBase = recaseFn(_.deburr(base));

    let name = normalizedBase;
    let i = 0;
    while (usedNames.has(name)) {
      name = normalizedBase + ++i;
    }

    usedNames.add(name);
    return name;
  };
}
