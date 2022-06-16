var globals = require('./cfu/scripts/rollup-injects.js');

delete globals.include;

const globalTypeNameSpace = [
  'NodeJS',
  'UPI',
  'Common',
  'Payment',
  'Downtime',
  'Offers',
  'NavStack',
  'EMIPlanView',
];

var globalRollupReplace = [
  '__SIFT_BEACON_KEY__',
  '__CYBER_SOURCE_RZP_ORG_ID__',
  '__BUILD_NUMBER__',
];
globals = ['window', 'console', ...globalTypeNameSpace]
  .concat(Object.keys(globals))
  .concat(globalRollupReplace);

var blacklistVars = globals.map((g) => `VariableDeclarator[id.name=${g}]`);

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  globals: globals.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {}),
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    extraFileExtensions: ['.svelte'],
  },
  plugins: ['svelte3', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'prettier',
  ],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
    },
    {
      files: ['*.ts', '**/*.svelte'], // Your TypeScript files extension

      // extend TypeScript plugins here,
      // instead of extending them outside the `overrides`.
      // If you don't want to extend any rules, you don't need an `extends` attribute.
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],

      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
      rules: {
        'no-undef': 2,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-call': 0, // can enable later
        '@typescript-eslint/no-unsafe-member-access': 0, // can enable later
        '@typescript-eslint/no-unsafe-return': 0, // can enable later
        '@typescript-eslint/no-unsafe-argument': 1,
        '@typescript-eslint/restrict-template-expressions': 1,
        '@typescript-eslint/restrict-plus-operands': 1,
        '@typescript-eslint/no-floating-promises': 0,
        '@typescript-eslint/ban-types': 1,
        'prefer-rest-params': 1,
        'no-var': 1,
        '@typescript-eslint/no-this-alias': [
          'error',
          {
            allowDestructuring: false, // Disallow `const { props, state } = this`; true by default
            allowedNames: ['self'], // Allow `const self = this`; `[]` by default
          },
        ],
      },
    },
  ],
  settings: {
    'svelte3/typescript': true,
    // ignore style tags in Svelte because of Tailwind CSS
    // See https://github.com/sveltejs/eslint-plugin-svelte3/issues/70
    'svelte3/ignore-styles': () => true,
  },
  ignorePatterns: ['node_modules'],
  rules: {
    // fixable by prettier
    indent: 0,
    semi: 0,
    quotes: 0,
    'no-var': 0,
    'no-debugger': 2, // not allow debugger in source
    'no-empty': 0, // allow empty block, usually after catch(e){}
    'no-console': 1, // allow console
    eqeqeq: 2, // enfore ===/!== instead of ==/!=
    'no-caller': 2, // disable arguments.callee or caller usage
    'no-extend-native': 2, // disallow meddling with built-in object prototypes
    'no-proto': 2, // disable __proto__
    'no-useless-escape': 0,
    'no-prototype-builtins': 0, // Access Object.prototype method 'hasOwnProperty' from target object
    curly: 2, // Require curly braces
    'linebreak-style': [2, 'unix'],
    'no-var': 1,
    // disable getters and setters
    'no-restricted-syntax': [
      2,
      // allows treeshake.propertyReadSideEffects = false
      'Property[kind=/^[gs]et$/]',
      // 'MethodDefinition[kind=/^[gs]et$/]', we support get set

      // allows 'SpreadElement',
      'Identifier[name=/^(Symbol|Proxy)$/]', // support Map

      'FunctionExpression[generator=true]',
      ...blacklistVars,
    ],
    // ...
  },
};
