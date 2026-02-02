import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Root ESLint config for the monorepo.
 * Applies to all packages/* and scripts.
 */
export default [
  // 1) Ignore generated & external folders
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/*.cjs",
        "**/*.config.*",
        "**/prettier.config.*",
        "**/tsup.config.*",
        "**/eslint.config.*"
    ]
  },

  // 2) Base JS rules
  js.configs.recommended,

  // 3) TypeScript support
  ...tseslint.configs.recommended,

  // 4) Project-specific overrides
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    rules: {
      // Keep things strict but not annoying
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" }
      ],

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  }
];
