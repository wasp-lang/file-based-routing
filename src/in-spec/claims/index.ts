import type * as spec from "@wasp.sh/spec";

/**
 * Parsers or matchers can "claim" files or routes.
 *
 * That means that the plugin will error out if another parser also claims them.
 * This is used to prevent conflicts between different parsers or matchers that
 * may try to handle the same file or route.
 */
export type Claim = FileClaim | RouteClaim | GlobClaim;

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
