const babel = require('rollup-plugin-babel');
const include = require('rollup-plugin-includepaths');
const { aliases } = require('./scripts/console-commands');
const inject = require('rollup-plugin-inject');
const doT = require('dot');
const fs = require('fs');

require('child_process').execSync('mkdir -p app/modules/generated');

let injects = {
  global: ['generated/globals', 'global'],
  _: ['lib/_', '*'],
  _Arr: ['lib/_Arr', '*'],
  _Str: ['lib/_Str', '*'],
  _Func: ['lib/_Func', '*'],
  _Obj: ['lib/_Obj', '*'],
  _El: ['lib/_El', '*'],
  _Doc: ['lib/_Doc', '*'],
  fetch: 'lib/fetch',
  jsonp: 'lib/jsonp',
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
      'unescape',
    ]
      .map(command => {
        injects[command] = ['generated/globals', command];
        return `export const ${command} = global.${command}`;
      })
      .join(';')
);

module.exports = [
  {
    name: 'dot',
    transform(code, id) {
      if (id.endsWith('.jst')) {
        let exportIndex = code.indexOf('export default ');
        if (exportIndex === -1) {
          throw "Template does'nt export anything";
        }
        exportIndex += 15;
        return {
          code:
            code.slice(0, exportIndex) + doT.template(code.slice(exportIndex)),
        };
      }
    },
  },

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
