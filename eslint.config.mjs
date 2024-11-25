import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-use-before-define": "error",
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
];
