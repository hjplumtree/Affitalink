import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const compatibleNextVitals = nextVitals.map((config) =>
  config.plugins?.["react-hooks"]
    ? {
        ...config,
        rules: {
          ...config.rules,
          // Keep the six known loader warnings visible; a seventh warning fails lint.
          "react-hooks/set-state-in-effect": "warn",
        },
      }
    : config,
);

export default defineConfig([
  ...compatibleNextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".gstack/**",
    ".omx/**",
    "tests/**",
  ]),
]);
