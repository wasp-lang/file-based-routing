# Default style conventions

The default style (`@wasp.sh/file-based-routing/styles/default`) is the set of conventions applied by `fileBased` unless you pass a different `style`. It scans `baseDir`, applies the conventions below, and reports any conflicts.

## File conventions

All paths below are relative to `baseDir` (default `src/app`). Files may use any of these extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`. Files with other extensions are ignored.

| File pattern | Produces | Looked up |
| --- | --- | --- |
| `**/page.{ext}` | `page` + `route` | anywhere |
| `**/<method>.api.{ext}` | `api` | anywhere |
| `**/api-namespace.{ext}` | `apiNamespace` | anywhere |
| `queries/**/*.{ext}` | `query` | top-level `queries/`, or nested in route groups |
| `actions/**/*.{ext}` | `action` | top-level `actions/`, or nested in route groups |
| `jobs/**/*.{ext}` | `job` | top-level `jobs/`, or nested in route groups |

### Pages and routes

A `page.tsx` produces a `page` (whose component is the file's default export) and a `route` that renders it. The route path comes from the directory path leading to the file:

| File                        | Route path          |
| --------------------------- | ------------------- |
| `page.tsx`                  | `/`                 |
| `settings/profile/page.tsx` | `/settings/profile` |

Dynamic segments use bracket syntax in directory names:

| Directory segment | Route segment | Meaning                       |
| ----------------- | ------------- | ----------------------------- |
| `[id]`            | `:id`         | dynamic parameter             |
| `[[lang]]`        | `:lang?`      | optional dynamic parameter    |
| `[...rest]`       | `*`           | splat (trailing segment only) |

`[...rest]` is only treated as a splat when it is the last segment before `page.tsx`. Elsewhere it is kept verbatim.

```
src/app/
  page.tsx                     ->  route "/"
  users/[id]/page.tsx          ->  route "/users/:id"
  docs/[[lang]]/page.tsx       ->  route "/docs/:lang?"
  files/[...rest]/page.tsx     ->  route "/files/*"
```

A directory wrapped in parentheses is a **route group**: it organizes files without contributing a segment to the route. This works for every kind of spec.

```
src/app/
  dashboard/(logged-in)/my-profile/page.tsx  ->  route "/dashboard/my-profile"
```

### APIs

The HTTP method is the file name prefix: `get.api.ts`, `post.api.ts`, `put.api.ts`, `delete.api.ts`, or `all.api.ts`. The path comes from the directory, like pages:

```
src/app/
  webhooks/post.api.ts         ->  api  POST  /webhooks
  tasks/get.api.ts             ->  api  GET   /tasks
  get.api.ts                   ->  api  GET   /
```

Several methods may share a path (`tasks/get.api.ts` and `tasks/post.api.ts`), except for `all.api.ts` files, which already respond to every method, so it cannot coexist with another API on the same path.

### API namespaces

An `api-namespace.ts` registers middleware (its default export) on a path prefix derived from its directory. A namespace does not own a route, so it can share a path with a page or APIs.

```
src/app/
  external/api-namespace.ts    ->  apiNamespace  /external
```

### Queries, actions, and jobs

These are looked up in the top-level `queries/`, `actions/`, and `jobs/` directories. The function is the file's default export. Since they have no route, only the file name names the spec. You may still organize files into route groups (directories wrapped in parentheses), which don't affect the name; any other subdirectory is an error, so a misplaced file fails loudly instead of being silently skipped.

```
src/app/
  queries/getTasks.ts             ->  query   (getTasksQuery)
  actions/createTask.ts           ->  action  (createTaskAction)
  jobs/sendDigest.ts              ->  job     (sendDigestJob, executor "PgBoss")
  queries/(admin)/getUsers.ts     ->  query   (getUsersQuery)
```

Jobs default to the `PgBoss` executor; override it via an options file.

## Spec names

Each declaration gets a generated name derived from its route path or file name, converted to English characters (`café` -> `Cafe`), cased by kind, and suffixed by kind. Pages and routes are `PascalCased`; queries, actions, jobs, APIs, and API namespaces are `camelCased` to match Wasp's conventions:

| Kind          | Suffix         | Example                |
| ------------- | -------------- | ---------------------- |
| Page          | `Page`         | `SettingsProfilePage`  |
| Route         | `Route`        | `SettingsProfileRoute` |
| Query         | `Query`        | `getTasksQuery`        |
| Action        | `Action`       | `createTaskAction`     |
| Job           | `Job`          | `sendDigestJob`        |
| API           | `Api`          | `webhooksPostApi`      |
| API namespace | `ApiNamespace` | `externalApiNamespace` |

The root path maps to the name `Root` (`RootPage`, `RootRoute`, `rootGetApi`). For APIs the method is folded into the name so methods sharing a path get distinct names (`tasksGetApi`, `tasksPostApi`). If two names still collide after casing, a numeric suffix is appended (`MyPagePage`, `MyPagePage1`).

## Options files

To pass configuration to a generated declaration, add a sibling **options file** in the same directory as the route file. It must have a default export whose keys match the route kind:

| Route file              | Options file                    | Allowed keys    |
| ----------------------- | ------------------------------- | --------------- |
| `page.tsx`              | `page.options.ts`               | `page`, `route` |
| `<method>.api.ts`       | `api.<method>.options.ts`       | `api`           |
| `queries/getTasks.ts`   | `queries/getTasks.options.ts`   | `query`         |
| `actions/createTask.ts` | `actions/createTask.options.ts` | `action`        |
| `jobs/sendDigest.ts`    | `jobs/sendDigest.options.ts`    | `job`           |

API namespaces do not support options; an options file next to one is ignored.

```ts
// src/app/dashboard/page.options.ts
export default {
  page: { authRequired: true },
  route: { lazy: true },
};
```

```ts
// src/app/jobs/sendDigest.options.ts
export default {
  job: { schedule: { cron: "0 * * * *" } },
};
```

Options files are excluded from route discovery (a `*.options.ts` in `actions/` is not treated as an action), and their keys are validated strictly: an unknown or out-of-kind key (e.g. `job` under a page) is a hard error.

### Typed options with `options()`

The package's main entry exports an `options()` identity helper and the `Options` type so you get autocompletion and type-checking on options objects:

```ts
import { options } from "@wasp.sh/file-based-routing";

// src/app/dashboard/page.options.ts
export default options({
  page: { authRequired: true },
  route: { lazy: true },
});
```

Options files can also have a `.wasp.ts` extension (`page.options.wasp.ts`, `api.post.options.wasp.ts`, ...) and they'll be handled accordingly by Wasp, e.g. so `with { type: "ref" }` imports get transformed.
