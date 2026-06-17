import * as path from "node:path";
import { describe, it } from "vitest";
import { fileBased } from "../../src/spec";
import { makeRef } from "../helpers";

describe.for([
  ["action-basic", "creates an action from a file in the `actions` directory"],
  ["action-ignores-nested", "only looks in the top-level `actions` directory"],
  [
    "action-options",
    "applies options from a sibling `<name>.options` file, without treating it as an action",
  ],
  [
    "api-all-and-post-collision",
    "rejects an `all` api colliding with a `post` api on the same path",
  ],
  [
    "api-basic",
    "creates an api from a `<method>.api` file, using its directory as the path",
  ],
  [
    "api-collision",
    "uniquifies spec names for several methods on the same path",
  ],
  ["api-methods", "supports all HTTP methods, upper-casing the file name"],
  [
    "api-namespace-basic",
    "creates an apiNamespace from an `api-namespace` file",
  ],
  [
    "api-namespace-options",
    "doesn't support options, ignoring a sibling `options` file",
  ],
  [
    "api-namespace-root",
    "maps an api-namespace file at the base directory to the root path",
  ],
  ["api-options", "applies `api` options from a sibling `options` file"],
  ["api-root", "maps an api file at the base directory to the root path"],
  ["file-based-all-kinds", "collects every route type, in parser order"],
  [
    "file-based-default-base-dir",
    "defaults to scanning `src/app` under the current working directory",
  ],
  ["file-based-empty", "returns nothing for an empty app"],
  [
    "file-based-name-collision",
    "uniquifies the spec name of an api namespace sharing a page's path",
  ],
  ["job-basic", "creates a job with the PgBoss executor by default"],
  ["job-ignores-nested", "only looks in the top-level `jobs` directory"],
  [
    "job-options",
    "applies options from a sibling `<name>.options` file, without treating it as a job",
  ],
  [
    "page-and-all-api-collision",
    "rejects an `all` api colliding with a page on the same path",
  ],
  [
    "page-and-get-api-collision",
    "rejects a `get` api colliding with a page on the same path",
  ],
  [
    "page-and-post-api-ok",
    "allows a `post` api to share a path with a page, since the page only serves GET",
  ],
  ["page-collision", "uniquifies spec names that collide after pascal-casing"],
  [
    "page-deburr",
    "deburrs non-ASCII route names but keeps the route path intact",
  ],
  ["page-dynamic", "transforms `[param]` into a dynamic path component"],
  [
    "page-extensions",
    "accepts every allowed extension and ignores other files",
  ],
  [
    "page-invalid-options",
    "rejects options files with keys not allowed for the route type",
  ],
  [
    "page-mid-splat",
    "doesn't interpret `[...rest]` as a splat when it is not the last path component",
  ],
  [
    "page-nested",
    "derives the route path and spec name from nested directories",
  ],
  [
    "page-optional-dynamic",
    "transforms `[[param]]` into an optional dynamic path component",
  ],
  [
    "page-options",
    "applies `page` and `route` options from a sibling `options` file",
  ],
  ["page-root", "creates a page and a route for a page file at the root"],
  ["page-splat", "transforms a trailing `[...rest]` into a splat"],
  ["query-basic", "creates a query from a file in the `queries` directory"],
  ["query-ignores-nested", "only looks in the top-level `queries` directory"],
  [
    "query-options",
    "applies options from a sibling `<name>.options` file, without treating it as a query",
  ],
  [
    "reserved-dir-file-conflict",
    "rejects a file that collides with a reserved directory like `queries`",
  ],
  [
    "reserved-dir-nested-conflict",
    "rejects a file nested inside a reserved directory like `queries`",
  ],
])("%s: %s", ([testDirName]) => {
  const testDir = path.join(import.meta.dirname, testDirName);
  const snapshotPath = path.join(testDir, "output.json");
  const inputDir = path.join(testDir, "input");

  it("matches snapshot", async ({ expect }) => {
    const ref = makeRef(inputDir);

    const fileBasedResult = fileBased({ ref, baseDir: inputDir });

    const snapshotContent = await fileBasedResult
      .then(
        (result) => ({ type: "success", result }),
        (error) => ({
          type: "error",
          error:
            error instanceof Error
              ? { name: error.name, message: error.message }
              : String(error),
        }),
      )
      .then((result) => JSON.stringify(result, null, 2));

    await expect(snapshotContent).toMatchFileSnapshot(snapshotPath, "output");
  });
});
