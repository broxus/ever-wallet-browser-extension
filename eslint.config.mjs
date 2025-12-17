import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import broxusEslint from '@broxus/eslint-config/flat'

export default defineConfig([
    globalIgnores(["**/node_modules", "**/dist", "*.mjs", "src/abi", "**/*.d.ts"]),
    ...broxusEslint.configs.recommended,
    ...broxusEslint.configs.react,
    ...broxusEslint.configs.reactHooks,
    ...broxusEslint.configs.typescript, {
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        ecmaVersion: 5,
        sourceType: "commonjs",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    rules: {
        "arrow-parens": "off",
        "class-methods-use-this": "off",
        "max-classes-per-file": "off",
        "sort-keys": "off",
        "object-curly-newline": "off",
        "prefer-destructuring": "off",
        "one-var": "off",
        "no-case-declarations": "off",
        "no-continue": "off",
        "no-await-in-loop": "off",
        "no-restricted-syntax": "off",
        "no-plusplus": "off",

        "no-param-reassign": ["error", {
            props: false,
        }],

        "no-restricted-globals": "off",
        "no-empty-function": "off",
        "react/state-in-constructor": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-one-expression-per-line": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-shadow": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-unsafe-function-type": "off",
        "jsx-a11y/anchor-is-valid": "off",
        "jsx-a11y/label-has-associated-control": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "warn",
        "jsx-a11y/no-static-element-interactions": "warn",
        "jsx-a11y/click-events-have-key-events": "warn",
        "react/function-component-definition": "off",
        "no-nested-ternary": "off",
        "react/no-multi-comp": "off",

        "import-x/consistent-type-specifier-style": "off",
        "perfectionist/sort-objects": "off",
        "perfectionist/sort-imports": "off",
        "perfectionist/sort-object-types": "off",
        "perfectionist/sort-named-imports": "off",
        "perfectionist/sort-variable-declarations": "off",
        "perfectionist/sort-interfaces": "off",
        "perfectionist/sort-exports": "off",
        "perfectionist/sort-named-exports": "off",
        "perfectionist/sort-sets": "off",
        "@stylistic/operator-linebreak": "off",
        "@stylistic/arrow-parens": "off",
        "@stylistic/jsx-sort-props": "off",
        "@stylistic/jsx-one-expression-per-line": "off",
    },
}]);
