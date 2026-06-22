import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    // Backend + tests run on Node.
    files: ["server/**/*.js", "*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // Scriptable scripts run inside the Scriptable app, not Node — they use
    // iOS host globals (ListWidget, SFSymbol, config, Script, WebView, …).
    // Lint them only for real errors, with those globals declared.
    files: ["prototype/scriptable/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: {
        ListWidget: "readonly", LinearGradient: "readonly", Color: "readonly",
        Font: "readonly", Size: "readonly", SFSymbol: "readonly",
        WebView: "readonly", Request: "readonly", config: "readonly",
        Script: "readonly", args: "readonly", console: "readonly",
        document: "readonly", Alert: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    ignores: ["node_modules/**", "server/data/**"],
  },
];
