import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/spec.ts"],
  outDir: "dist",
  clean: true,

  platform: "node",
  target: "es2025",

  sourcemap: true,
  dts: { sourcemap: true },
});
