import type * as spec from "@wasp.sh/spec";
import MagicString from "magic-string";
import * as path from "node:path";
import type { Plugin } from "rolldown";
import { unrun } from "unrun";

/**
 * A `ref` helper is handed to the bundled options module through `globalThis`,
 * keyed by this symbol. We can't pass a live function into a freshly bundled and
 * imported module any other way, and the transform below emits code that reads
 * it back out. Loading happens one options file at a time, so there's no risk of
 * two files racing over the same slot.
 */
const REF_HELPER_KEY = Symbol.for("@wasp.sh/file-based-routing:ref");

type GlobalWithRefHelper = typeof globalThis & {
  [REF_HELPER_KEY]?: typeof spec.ref;
};

/**
 * Loads an options file and returns its default export, applying the same
 * `with { type: "ref" }` import transform that Wasp applies to `*.wasp.ts`
 * files. Without this, a `with { type: "ref" }` import inside an options file
 * would be resolved and executed by Node as an ordinary module instead of being
 * turned into a Wasp ref.
 */
export async function loadOptionsFileDefaultExport(
  absOptionsFilePath: string,
  ref: typeof spec.ref,
): Promise<unknown> {
  const globalWithRefHelper = globalThis as GlobalWithRefHelper;
  globalWithRefHelper[REF_HELPER_KEY] = ref;

  try {
    const { module } = await unrun<{ default?: unknown }>({
      path: absOptionsFilePath,
      // `bundle-require` returns the whole module namespace (instead of just the
      // default export), so we can pick the default ourselves.
      // https://gugustinette.github.io/unrun/advanced/presets.html
      preset: "bundle-require",
      inputOptions: {
        plugins: [transformRefImportsPlugin()],
      },
    });
    return module?.default;
  } finally {
    delete globalWithRefHelper[REF_HELPER_KEY];
  }
}

/**
 * A Rolldown plugin that lowers `with { type: "ref" }` imports into calls to the
 * `ref` helper stashed on `globalThis`, mirroring Wasp's own transform. Each
 * ref import becomes a `const` bound to a ref object whose `from` is resolved to
 * an absolute path, so the resulting ref doesn't depend on which file the helper
 * was created for.
 */
function transformRefImportsPlugin(): Plugin {
  return {
    name: "wasp-file-based-routing/transform-ref-imports",
    transform(code, id) {
      // Cheap guard so we only parse modules that might contain a ref import.
      if (!code.includes("ref")) return null;

      const ast = this.parse(code, { lang: langFromId(id) }) as unknown as {
        body: AstNode[];
      };

      const refImports = ast.body.filter(isRefImportDeclaration);
      if (refImports.length === 0) return null;

      const magicString = new MagicString(code);

      const declarations = refImports.flatMap((node) => {
        magicString.remove(node.start, node.end);
        const from = resolveRefFrom(getStringValue(node.source) ?? "", id);
        return node.specifiers.map((specifier) =>
          refConstDeclaration(specifier, from),
        );
      });

      magicString.prepend(declarations.join(""));

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      };
    },
  };
}

function langFromId(id: string): "ts" | "tsx" {
  // The `ts` parser handles plain JS too, so we only need to distinguish JSX.
  return /\.[mc]?[jt]sx$/.test(id) ? "tsx" : "ts";
}

/**
 * Resolves a ref import's source to an absolute path when it's relative, so the
 * ref is independent of the file the `ref` helper was bound to (matching how the
 * built-in parsers pass absolute paths to `ctx.ref`). Bare specifiers are left
 * untouched for Wasp to validate.
 */
function resolveRefFrom(source: string, importerId: string): string {
  return source.startsWith(".")
    ? path.resolve(path.dirname(importerId), source)
    : source;
}

function refConstDeclaration(specifier: ImportSpecifierNode, from: string) {
  const refHelper = `globalThis[Symbol.for(${JSON.stringify(
    REF_HELPER_KEY.description,
  )})]`;

  switch (specifier.type) {
    case "ImportDefaultSpecifier":
      return `const ${specifier.local.name} = ${refHelper}(${JSON.stringify({
        importDefault: specifier.local.name,
        from,
      })});\n`;
    case "ImportSpecifier": {
      const imported = specifier.imported
        ? getStringValue(specifier.imported)
        : specifier.local.name;
      return `const ${specifier.local.name} = ${refHelper}(${JSON.stringify({
        import: imported,
        alias: specifier.local.name,
        from,
      })});\n`;
    }
    case "ImportNamespaceSpecifier":
      throw new Error(
        `Namespace imports are not supported for reference imports. ` +
          `Replace \`import * as ${specifier.local.name} from "${from}" with { type: "ref" }\` ` +
          `with a named or default reference import.`,
      );
  }
}

/** A minimal, structural view of the AST nodes this transform touches. */
interface AstNode {
  type: string;
}

interface StringLiteralOrIdentifier extends AstNode {
  name?: string;
  value?: string;
}

interface ImportSpecifierNode extends AstNode {
  type:
    | "ImportSpecifier"
    | "ImportDefaultSpecifier"
    | "ImportNamespaceSpecifier";
  local: { name: string };
  imported?: StringLiteralOrIdentifier;
}

interface ImportAttribute {
  key: StringLiteralOrIdentifier;
  value: StringLiteralOrIdentifier;
}

interface ImportDeclarationNode extends AstNode {
  type: "ImportDeclaration";
  start: number;
  end: number;
  source: StringLiteralOrIdentifier;
  specifiers: ImportSpecifierNode[];
  attributes: ImportAttribute[];
}

function isRefImportDeclaration(node: AstNode): node is ImportDeclarationNode {
  return (
    node.type === "ImportDeclaration" &&
    (node as ImportDeclarationNode).attributes.some(
      (attr) =>
        getStringValue(attr.key) === "type" &&
        getStringValue(attr.value) === "ref",
    )
  );
}

/** Import attribute keys/values can be either identifiers or string literals. */
function getStringValue(node: StringLiteralOrIdentifier): string | undefined {
  return node.type === "Identifier" ? node.name : node.value;
}
