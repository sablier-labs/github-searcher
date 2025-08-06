import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    extensions: [".js", ".ts", ".json"],
  },
  test: {
    coverage: {
      exclude: ["**/*.config.{js,ts}", "**/*.d.ts", "**/tests/**", "dist/**", "node_modules/**"],
      provider: "v8",
      reporter: ["json", "html", "text"],
    },
    environment: "happy-dom",
    globals: true,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
  },
});
