import { defineConfig } from "vitest/config";

export default defineConfig({
  // Avoid Windows safeRealpath exec("net use") in sandboxed environments.
  resolve: { preserveSymlinks: true },
  test: {
    pool: "threads"
  }
});
