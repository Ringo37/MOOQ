import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import { importX } from "eslint-plugin-import-x";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import { configs as tseslintConfigs } from "typescript-eslint";

export default [
  {
    ignores: [
      ".react-router/**",
      "build/**",
      "node_modules/**",
      "generated/prisma/**",
    ],
  },
  js.configs.recommended,
  ...tseslintConfigs.recommended,

  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },

  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "import-x/no-dynamic-require": "warn",
      "import-x/no-nodejs-modules": "warn",
      "import-x/order": [
        "error",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: ["builtin", "external", "internal", "parent", "sibling"],
          "newlines-between": "always",
        },
      ],
    },
  },

  {
    files: ["**/*.cjs"],
    rules: {
      "import-x/no-commonjs": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  eslintConfigPrettier,
];
