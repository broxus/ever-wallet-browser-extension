import { defineConfig } from 'oxfmt';

export default defineConfig({
    printWidth: 120,
    tabWidth: 4,
    singleQuote: true,
    semi: true,
    ignorePatterns: ['*.yml', '*.md', 'src/api/**/*', 'src/abi/**/*', 'src/manifest/**/*'],
    overrides: [{ files: ['*.json'], options: { tabWidth: 2 } }],
});
