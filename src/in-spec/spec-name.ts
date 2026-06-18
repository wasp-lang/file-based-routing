import * as _ from "es-toolkit";

export type SpecNameCasing = "PascalCase" | "camelCase";

export function specNameMaker() {
  const usedNames = new Set<string>();

  return (base: string, casing: SpecNameCasing = "PascalCase") => {
    const deburred = _.deburr(base);
    base =
      casing === "camelCase" ? _.camelCase(deburred) : _.pascalCase(deburred);
    let name = base;
    let i = 0;
    while (usedNames.has(name)) {
      name = base + ++i;
    }
    usedNames.add(name);
    return name;
  };
}
