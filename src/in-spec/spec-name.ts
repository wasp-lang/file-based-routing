import * as _ from "es-toolkit";

export function specNameMaker() {
  const usedNames = new Set<string>();

  return (base: string) => {
    base = _.pascalCase(_.deburr(base));
    let name = base;
    let i = 0;
    while (usedNames.has(name)) {
      name = base + ++i;
    }
    usedNames.add(name);
    return name;
  };
}
