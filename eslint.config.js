import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['node_modules/**', 'docs/**'] },
    js.configs.recommended,
    { files: ['js/**/*.js'], languageOptions: { globals: globals.browser } },
    {
        files: ['tests/**/*.js', 'scripts/**/*.{js,cjs}', '*.cjs', 'eslint.config.js'],
        languageOptions: { globals: globals.node },
    },
];
