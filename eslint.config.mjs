import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
        ...globals.jest,
      },
    },
    rules: {
      "no-use-before-define": "error",
      camelcase: "error",
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
];
