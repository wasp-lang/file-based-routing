import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { RouteType } from "../types";
import { conflictIsCompatible, type Conflict } from "./conflicts";
import type { Claim, FileClaim, GlobClaim, RouteClaim } from "./index";

export type NormalizedClaim = Exclude<Claim, GlobClaim>; // Glob claims are normalized to file claims before being stored in the ClaimChecker.

export interface WithContext<T> {
  context: Context;
  value: T;
}

export interface Context {
  parserId: RouteType;
  matchedFile?: string;
}

export class ClaimChecker {
  readonly #conflicts: Conflict[] = [];
  getConflicts(): readonly Conflict[] {
    return [...this.#conflicts];
  }

  async addClaims(
    claims: readonly Claim[],
    { baseDir, ...context }: { baseDir: string } & Context,
  ) {
    for (const rawClaim of claims) {
      for await (const claim of normalizeClaim(rawClaim, { baseDir })) {
        this.#addNormalizedClaim({ context, value: claim });
      }
    }
  }

  #addNormalizedClaim({ context, value: claim }: WithContext<NormalizedClaim>) {
    switch (claim.type) {
      case "file": {
        return this.#addFileClaim({ context, value: claim });
      }

      case "route": {
        return this.#addRouteClaim({ context, value: claim });
      }

      default: {
        return claim satisfies never;
      }
    }
  }

  #fileClaims = new Map<string, WithContext<FileClaim>>();
  #addFileClaim(claim: WithContext<FileClaim>) {
    const key = claim.value.path;
    const existingClaim = this.#fileClaims.get(key);

    if (existingClaim) {
      const conflict: Conflict = {
        type: "file",
        value: claim.value.path,
        existing: existingClaim.context,
        conflicting: claim.context,
      };
      if (!conflictIsCompatible(conflict)) {
        this.#conflicts.push(conflict);
      }
    }

    return this.#fileClaims.set(key, claim);
  }

  #routeClaims = new Map<string, WithContext<RouteClaim>>();
  #addRouteClaim(claim: WithContext<RouteClaim>) {
    const key = `${claim.value.method}:${claim.value.route}`;
    const existingClaim = this.#routeClaims.get(key);

    if (existingClaim) {
      const conflict: Conflict = {
        type: "route",
        value: `${claim.value.method} ${claim.value.route}`,
        existing: existingClaim.context,
        conflicting: claim.context,
      };
      if (!conflictIsCompatible(conflict)) {
        this.#conflicts.push(conflict);
      }
    }

    return this.#routeClaims.set(key, claim);
  }
}

async function* normalizeClaim(
  claim: Claim,
  { baseDir }: { baseDir: string },
): AsyncIterable<NormalizedClaim> {
  if (claim.type === "file" && "glob" in claim) {
    for await (const file of fs.glob(claim.glob, { cwd: baseDir })) {
      yield* normalizeClaim({ type: "file", path: file }, { baseDir });
    }
  } else if (claim.type === "file") {
    yield { ...claim, path: path.resolve(baseDir, claim.path) };
  } else {
    yield { ...claim, route: dropTrailingSlash(claim) };
  }
}

function dropTrailingSlash(claim: RouteClaim): string {
  return claim.route.replace(/\/$/g, "");
}
