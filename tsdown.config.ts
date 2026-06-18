import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    spec: "src/spec.ts",
    "styles/default": "src/styles/default/index.ts",
    "styles/concise": "src/styles/concise/index.ts",
  },
  outDir: "dist",
  clean: true,

  platform: "node",
  target: "es2025",

  sourcemap: true,
  dts: { sourcemap: true },

  attw: { profile: "esm-only" },
  publint: true,
});
