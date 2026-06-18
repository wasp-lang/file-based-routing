import { middlewareConfigFn } from "./middleware" with { type: "ref" };

export default {
  api: {
    entities: ["User"],
    middlewareConfigFn,
  },
};
