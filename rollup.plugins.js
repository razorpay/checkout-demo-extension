const babel = require('rollup-plugin-babel');
const include = require('rollup-plugin-includepaths');
const { aliases } = require('./scripts/console-commands');
const inject = require('rollup-plugin-inject');
const fs = require('fs');

require('child_process').execSync('mkdir -p app/modules/generated');

let injects = {
  global: ['generated/globals', 'global'],
  _: ['implicit/_', '*'],
  _Arr: ['implicit/_Arr', '*'],
  _Str: ['implicit/_Str', '*'],
  _Func: ['implicit/_Func', '*'],
  _Obj: ['implicit/_Obj', '*'],
  _El: ['implicit/_El', '*'],
  _Doc: ['implicit/_Doc', '*'],
};

fs.writeFileSync(
  'app/modules/generated/globals.js',
  'export const global = window;' +
    [
      'Boolean',
      'Array',
      'Object',
      'String',
      'Number',
      'Date',
      'Math',
      'setTimeout',
      'setInterval',
      'clearTimeout',
      'clearInterval',
      'parseInt',
      'encodeURIComponent',
      'decodeURIComponent',
      'btoa',
    ]
      .map(command => {
        injects[command] = ['generated/globals', command];
        return `export const ${command} = global.${command}`;
      })
      .join(';')
);

module.exports = [
  include({
    paths: ['app/modules'],
  }),

  babel({
    include: ['app/modules/**/*.js', 'app/templates/**/*.jst'],

    plugins: [
      '@babel/transform-arrow-functions',
      '@babel/transform-block-scoped-functions',
      '@babel/transform-block-scoping',
      ['@babel/transform-computed-properties', { loose: true }],
      '@babel/transform-destructuring',

      // loose mode: parameters with default values
      // will be counted into the arity of the function
      ['@babel/transform-parameters', { loose: true }],

      '@babel/transform-shorthand-properties',
      ['@babel/transform-template-literals', { loose: true }],

      '@babel/proposal-pipeline-operator',

      [
        './trace.js',
        {
          aliases,
        },
      ],
    ],
  }),

  inject(injects),
];
