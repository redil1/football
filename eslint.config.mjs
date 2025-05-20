import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  // General configuration for all JS/TS files (browser focus initially)
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add node globals generally as Next.js can use them in SSR context
      },
      ecmaVersion: "latest",
      sourceType: "module", // Default to ES modules
    },
    plugins: {
      js: js, // if you explicitly use 'js' plugin
      '@typescript-eslint': tseslint.plugin, // Correct way to reference typescript-eslint plugin
      react: pluginReact,
    },
    rules: {
      // Add any global rules or overrides here
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_',
        },
      ],
    }
  },
  js.configs.recommended, // Apply ESLint's recommended JavaScript rules
  ...tseslint.configs.recommended, // Apply TypeScript recommended rules (ensure this is spread)
  pluginReact.configs.flat.recommended, // Apply React recommended rules
  {
    // Settings for eslint-plugin-react
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
  },
  // Specific configuration for server.js
  {
    files: ["server.js"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs", // Specify CommonJS for server.js
      ecmaVersion: "latest",
    },
    rules: {
      // Add any server.js specific rules or overrides here
      // For example, if you have specific Node.js patterns
      '@typescript-eslint/no-var-requires': 'off', // Allow 'const x = require()' in server.js
      '@typescript-eslint/no-require-imports': 'off', // Allow 'require()' style imports in server.js
    }
  }
]);
