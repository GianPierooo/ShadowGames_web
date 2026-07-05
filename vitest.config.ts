import { defineConfig } from "vitest/config";

// Tests OFFLINE (fixtures + unidades). El health-check en vivo es un script tsx
// aparte (scripts/health-check.ts), no un test de vitest → no depende de red.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
