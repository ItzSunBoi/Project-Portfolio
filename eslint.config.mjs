import eslintPluginAstro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier";
import typescriptEslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".astro/**",
      ".sites-runtime/**",
      ".wrangler/**",
      "dist/**",
      "node_modules/**",
    ],
  },
  ...typescriptEslint.configs.recommended,
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
  },
  eslintConfigPrettier,
];
