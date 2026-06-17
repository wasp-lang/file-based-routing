# Wasp file-based routing

> [!WARNING]
> This is unstable and unpublished. We are just working in the open.

Generate Wasp spec elements from your project's file layout. Instead of listing every page, query, action, job, and API in your Wasp config by hand, you drop files in conventional locations and this package derives the corresponding `page`, `route`, `query`, `action`, `job`, `api`, and `apiNamespace` declarations for you.

It plugs into Wasp Spec and returns Spec elements, so you can mix file-based declarations with hand-written ones freely.

## Install

```bash
npm install @wasp.sh/file-based-routing
```

You need to be using Wasp 0.24.

## Usage

In your Wasp TS spec config, call `fileBased` and spread the result into the `spec` array. Pass it `ref` from `@wasp.sh/spec` so it can build reference imports to your component and function files.

```ts
import { app, ref, route, page } from "@wasp.sh/spec";
import { fileBased } from "@wasp.sh/file-based-routing/spec";

export default app({
  wasp: { version: "^0.24.0" },
  spec: [
    // Hand-written declarations still work:
    route("AboutRoute", "/about", page(ref(/* ... */))),

    // Everything discovered from the filesystem:
    await fileBased({ ref }),
  ],
});
```

### Options

```ts
fileBased({
  ref, // required: spec.ref, used to build import references
  baseDir, // optional: directory to scan (default: <cwd>/src/app)
  style, // optional: the set of conventions to apply (default: defaultStyle)
});
```

A **style** is a named set of parsers that defines the file conventions. The
default style (`@wasp.sh/file-based-routing/styles/default`) is used unless you
pass a different `style`; passing another swaps the conventions out.

`fileBased` will scan `baseDir`, apply the style's conventions, and report any conflicts.

## Conventions

See [the default style conventions](docs/styles/default.md) for the file layout, spec names, and options files used by the default style.

## Package entry points

| Import | Exports |
| --- | --- |
| `@wasp.sh/file-based-routing/spec` | `fileBased` |
| `@wasp.sh/file-based-routing` | `options`, the `Options` type, and the options type definitions |
| `@wasp.sh/file-based-routing/styles/default` | `defaultStyle` and the `Style` type |

> The `/spec` entry imports Node's filesystem APIs and is meant to run where your Wasp config is evaluated.
