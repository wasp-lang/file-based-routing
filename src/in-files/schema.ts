import * as z from "zod";
import type { FullOptions } from "./types";

const uncheckedObject = <T extends {}>() =>
  z.looseObject({}).pipe(z.custom<T>());

export const FullOptionsSchema = z.object({
  page: uncheckedObject().optional(),
  route: uncheckedObject().optional(),
}) satisfies z.ZodType<FullOptions>;
