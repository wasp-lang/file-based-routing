import * as spec from "@wasp.sh/spec";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { RouteType } from "./types";

/**
 * Parsers or matchers can "claim" files or routes.
 *
 * That means that the plugin will error out if another parser also claims them.
 * This is used to prevent conflicts between different parsers or matchers that
 * may try to handle the same file or route.
 */
export type Claim = FileClaim | RouteClaim | GlobClaim;

export type NormalizedClaim = Exclude<Claim, GlobClaim>; // Glob claims are normalized to file claims before being stored in the ClaimChecker.

export interface FileClaim {
  type: "file";
  path: string;
}

export interface GlobClaim {
  type: "file";
  glob: string;
}

export interface RouteClaim {
  type: "route";
  route: string;
  method: spec.HttpMethod;
}

export class ClaimChecker {
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
      this.#assertClaimsCompatible(
        `File "${key}"`,
        existingClaim.context,
        claim.context,
      );
    }

    return this.#fileClaims.set(key, claim);
  }

  #routeClaims = new Map<string, WithContext<RouteClaim>>();
  #addRouteClaim(claim: WithContext<RouteClaim>) {
    const key = `${claim.value.method}:${claim.value.route}`;
    const existingClaim = this.#routeClaims.get(key);

    if (existingClaim) {
      this.#assertClaimsCompatible(
        `Route ${claim.value.method} "${claim.value.route}"`,
        existingClaim.context,
        claim.context,
      );
    }

    return this.#routeClaims.set(key, claim);
  }

  readonly #errors: Error[] = [];
  getErrors(): readonly Error[] {
    return [...this.#errors];
  }

  #assertClaimsCompatible(
    claimName: string,
    existingClaim: Context,
    newClaim: Context,
  ) {
    if (existingClaim.parserId !== newClaim.parserId) {
      this.#errors.push(
        new Error(
          `Conflict: ${claimName} is claimed by both parser "${existingClaim.parserId}" and parser "${newClaim.parserId}".`,
        ),
      );
    } else if (
      existingClaim.matchedFile &&
      existingClaim.matchedFile !== newClaim.matchedFile
    ) {
      this.#errors.push(
        new Error(
          `Conflict: ${claimName} is claimed by parser "${existingClaim.parserId}" in both "${existingClaim.matchedFile}" and "${newClaim.matchedFile}".`,
        ),
      );
    }
  }
}

interface WithContext<T> {
  context: Context;
  value: T;
}

interface Context {
  parserId: RouteType;
  matchedFile?: string;
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
