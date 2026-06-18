# Concise style conventions

The concise style (`@wasp.sh/file-based-routing/styles/concise`) is a terser variant of the [default style](./default.md). Pass it to `fileBased` via the `style` option:

```ts
import { fileBased } from "@wasp.sh/file-based-routing/spec";
import { conciseStyle } from "@wasp.sh/file-based-routing/styles/concise";

fileBased({ ref, style: conciseStyle });
```

It shares the default style's file conventions, with three differences:

- There are no options files. Configuration is set with route group components instead (see below).
- There is no `job` convention. Files under `jobs/` are ignored.
- Queries and actions may be nested under route groups (e.g. `queries/(auth)/getTasks.ts`).

## File conventions

All paths below are relative to `baseDir` (default `src/app`). Files may use any of these extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`.

| File pattern             | Produces         | Looked up                  |
| ------------------------ | ---------------- | -------------------------- |
| `**/page.{ext}`          | `page` + `route` | anywhere                   |
| `**/<method>.api.{ext}`  | `api`            | anywhere                   |
| `**/api-namespace.{ext}` | `apiNamespace`   | anywhere                   |
| `queries/**/*.{ext}`     | `query`          | under top-level `queries/` |
| `actions/**/*.{ext}`     | `action`         | under top-level `actions/` |

Pages, routes, APIs, API namespaces, and spec names all follow the [default style](./default.md#file-conventions). Only the configuration mechanism differs.

## Configuration via route groups

A directory wrapped in parentheses is a **route group**: it organizes files without contributing a segment to the route. The concise style reuses this mechanism to set parameters. Two group names are special:

| Route group | Effect |
| --- | --- |
| `(prerender)` | Prerenders the route (`route.prerender = true`). |
| `(auth)` | Requires auth on the page, api, query, or action in that subtree. |

Because they are route groups, they never appear in the output route.

```
src/app/
  dashboard/(auth)/page.tsx              ->  route "/dashboard", page authRequired
  blog/(prerender)/page.tsx              ->  route "/blog", route prerendered
  admin/(auth)/(prerender)/page.tsx      ->  route "/admin", authRequired + prerendered
  webhooks/(auth)/post.api.ts            ->  api  POST  /webhooks, auth required
  queries/(auth)/getSecrets.ts           ->  query GetSecretsQuery, auth required
  actions/(auth)/deleteTask.ts           ->  action DeleteTaskAction, auth required
```

`(auth)` sets `authRequired` on a page and `auth` on an api, query, or action. `(prerender)` only affects routes; on a path with no route it has no effect beyond grouping. Any other parenthesized directory (e.g. `(logged-in)`) remains a plain organizational group.
