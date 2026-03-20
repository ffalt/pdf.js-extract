import js from "@eslint/js";
import globals from "globals";
import jest from "eslint-plugin-jest";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		ignores: ["lib/pdfjs/**"]
	},
	{
		files: ["**/*.{js,mjs,cjs}"],
		plugins: { js },
		extends: ["js/recommended"],
		languageOptions: { globals: globals.node }
	},
	{
		files: ["**/*.test.{js,mjs,cjs}", "test/**/*.{js,mjs,cjs}"],
		plugins: { jest },
		languageOptions: { globals: globals.jest },
		rules: {
			"jest/no-disabled-tests": "warn",
			"jest/no-focused-tests": "error",
			"jest/no-identical-title": "error",
			"jest/valid-expect": "error"
		}
	}
]);
