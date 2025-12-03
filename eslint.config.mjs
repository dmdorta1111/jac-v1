import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Custom rules
  {
    rules: {
      // Allow unused vars prefixed with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Disable strict set-state-in-effect rule (common pattern in existing code)
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Exclude non-app directories (standalone scripts, tooling, configs)
    ".claude/**",
    "scripts/**",
    "smartassembly-work/**",
    "guide/**",
    "Markdown instructions/**",
    "docs/**",
    "plans/**",
    "project-docs/**",
  ]),
]);

export default eslintConfig;
