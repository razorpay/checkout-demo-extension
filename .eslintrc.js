module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  globals: {
    _Obj: true,
    _El: true,
    _Arr: true,
    _: true,
    fetch: true,
    __SIFT_BEACON_KEY__: true,
    __CYBER_SOURCE_RZP_ORG_ID__: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    extraFileExtensions: ['.svelte'],
  },
  plugins: ['svelte3', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  settings: {
    'svelte3/typescript': require('typescript'),
    // ignore style tags in Svelte because of Tailwind CSS
    // See https://github.com/sveltejs/eslint-plugin-svelte3/issues/70
    'svelte3/ignore-styles': () => true,
  },
  ignorePatterns: ['node_modules'],
  rules: {
    // ...
  },
};
