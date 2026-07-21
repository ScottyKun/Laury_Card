import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts", "public/sw.js"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;