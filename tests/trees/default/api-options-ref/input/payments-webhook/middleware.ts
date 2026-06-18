// A `with { type: "ref" }` import must be turned into a Wasp ref, not executed.
// If the transform fails and Node imports this module for real, this throw
// surfaces the regression.
export const middlewareConfigFn = () => {};

throw new Error("middleware.ts must not be executed; it should become a ref");
