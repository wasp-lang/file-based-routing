import type * as spec from "@wasp.sh/spec";
import type { UnionToTuple } from "type-fest";
import * as z from "zod";

export const HTTP_METHODS = [
  "ALL",
  "GET",
  "POST",
  "PUT",
  "DELETE",
] as const satisfies UnionToTuple<spec.HttpMethod>;

const HttpMethodsSchema = z.enum(HTTP_METHODS);

export const HTTP_METHODS_GLOB =
  "{" + HTTP_METHODS.map((method) => method.toLowerCase()).join(",") + "}";

/** Derives the HTTP method from an `<method>.api.<ext>` file name. */
export function apiMethodFromFileName(fileName: string): spec.HttpMethod {
  return HttpMethodsSchema.parse(fileName.split(".").at(0)?.toUpperCase());
}
