import * as _ from "es-toolkit";

export function specNameMaker() {
  const usedNames = new Set<string>();

  return (base: string) => {
    let name = _.pascalCase(_.deburr(base));
    let i = 0;
    while (usedNames.has(name)) {
      name = name + ++i;
    }
    usedNames.add(name);
    return name;
  };
}
