const globals = require('globals');
const pluginJs = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            },
            ecmaVersion: 2022,
            sourceType: 'commonjs'
        }
    },
    pluginJs.configs.recommended,
    {
        rules: {
            'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
            'no-console': 'off' // We allow console logs in this CLI tool/library context for now, or use logger
        }
    },
    eslintPluginPrettierRecommended
];
