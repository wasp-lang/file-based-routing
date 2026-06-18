# Contributing

Thanks for your interest in contributing to `@wasp.sh/file-based-routing`.

> [!WARNING]
> This package is unstable and unpublished. Expect things to change.

## Prerequisites

We use [mise](https://mise.jdx.dev/) to pin the toolchain. With mise installed:

```bash
mise install
```

This gives you the Node version declared in `mise.toml`. If you'd rather manage Node yourself, check that file for the expected version.

## Setup

```bash
npm ci
```

## Project layout

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the package is structured and how the parser/claims engine works. In short:

- `src/spec.ts` — the `fileBased` orchestrator (the `/spec` entry point).
- `src/in-spec/` — the style-agnostic engine: parsers, claims, spec-name generation.
- `src/styles/default/` — the built-in convention set.
- `tests/` — tree snapshot tests.

## Development workflow

Run these before opening a pull request. CI runs the same checks (see `.github/workflows/test.yml`).

```bash
npm test            # run the test suite (Vitest)
npm run typecheck   # tsc
npm run lint        # Biome
npm run format:check # Prettier
npm run build       # tsdown
```

To auto-fix issues:

```bash
npm run format      # apply Prettier
npm run lint:fix    # apply Biome fixes
```

## Tests

There are two layers, both run with Vitest:

- **Unit tests** (`src/**/__tests__/`) cover individual helpers.
- **Tree snapshot tests** (`tests/trees.test.ts`) are the main coverage. Each case under `tests/trees/<style>/<case>/` has:
  - `input/` — a file tree to scan.
  - `description.txt` — a short description of what the case exercises.
  - `output.json` — the snapshot of the resulting spec elements (or serialized error).

### Adding a tree test case

1. Create a new directory under `tests/trees/<style>/<case>/`.
2. Add an `input/` tree and a `description.txt`.
3. Generate the snapshot:

   ```bash
   npm run test:update
   ```

4. Review the generated `output.json` to confirm it matches what you expect, then commit it.

Prefer a focused tree case over a unit test when you're exercising end-to-end behavior of the conventions.

## Adding or changing conventions

A **style** is a bag of parsers. To add a new convention set, implement a `Parser` per route kind, assemble them into a `Style`, and add a `tests/trees/<your-style>/` directory registered in `tests/trees.test.ts`. The claims system, spec-name generator, and orchestration work unchanged. See the "Extending with a new style" section of [ARCHITECTURE.md](ARCHITECTURE.md).

## Pull requests

- Keep changes focused and include tests for new behavior.
- Make sure all checks above pass locally.
- Write a clear description of what changed and why.
