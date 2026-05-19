import { defineConfig } from 'oxlint';

export default defineConfig({
    plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'react'],
    rules: {
        'unicorn/no-new-array': 'off',
        'react/exhaustive-deps': 'off',
        'eslint/no-unused-vars': [
            'warn',
            {
                args: 'after-used',
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
    },
});
