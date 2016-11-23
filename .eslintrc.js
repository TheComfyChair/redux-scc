module.exports = {
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
            experimentalObjectRestSpread: true,
        }
    },
    plugins: [
        'react',
        'flowtype',
    ],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:flowtype/recommended'
    ],
    settings: {
        flowtype: {
            onlyFilesWithFlowAnnotation: true,
        }
    },
    rules: {
        'react/prop-types': ['off'],
        'react/display-name': ['off'],
        'no-console': ['off'],
        //'arrow-parens': ['warn', 'as-needed'],
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    globals: {
        _: true,
        _fmt: true,
        _misc: true,
        _arr: true,
        _cfg: true,
        Promise: true,
        RE_CHILD_INDEX_JS: true,
    }
};