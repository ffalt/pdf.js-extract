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
		languageOptions: { globals: globals.node },
		rules: {
			"arrow-body-style": ["error", "as-needed"],
			"arrow-parens": ["error", "as-needed"],
			"brace-style": ["error", "1tbs"],
			"comma-dangle": "error",
			"default-case": "error",
			"max-classes-per-file": ["error", 2],
			"max-len": ["error", { code: 240 }],
			"max-lines": ["error", 1000],
			"no-duplicate-case": "error",
			"no-duplicate-imports": "error",
			"no-empty": "error",
			"no-extra-bind": "error",
			"no-invalid-this": "error",
			"no-multiple-empty-lines": ["error", { max: 1 }],
			"no-new-func": "error",
			"no-param-reassign": "error",
			"no-redeclare": "error",
			"no-return-await": "error",
			"no-sequences": "error",
			"no-sparse-arrays": "error",
			"no-template-curly-in-string": "error",
			"no-void": "error",
			"prefer-const": "error",
			"prefer-object-spread": "error",
			"prefer-template": "error",
			"space-in-parens": ["error", "never"],
			"yoda": "error"
		}
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
