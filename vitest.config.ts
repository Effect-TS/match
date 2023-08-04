/// <reference types="vitest" />
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  test: {
    include: ["./test/**/*.test.ts"],
    globals: true,
    coverage: {
      provider: "v8",
    },
  },
  resolve: {
    alias: {
      "@effect/match/test": path.resolve(__dirname, "/test"),
      "@effect/match": path.resolve(__dirname, "/src"),
    },
  },
})
