import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".mjs" : ".cjs",
      };
    },
  },
  {
    entry: { "index.global": "src/index.ts" },
    format: ["iife"],
    globalName: "LuneSearch",
    splitting: false,
    sourcemap: true,
    clean: false,
    treeshake: true,
    minify: true,
    outExtension() {
      return { js: ".js" };
    },
  },
]);
