const babel = require('rollup-plugin-babel');
const include = require('rollup-plugin-includepaths');
const { aliases } = require('./scripts/console-commands');
const inject = require('rollup-plugin-inject');
const stylus = require('stylus');
const autoprefixer = require('autoprefixer-stylus');
const fs = require('fs');

require('child_process').execSync('mkdir -p app/modules/generated');

let injects = {
  global: ['generated/globals', 'global'],
  fetch: 'implicit/fetch',
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
      'unescape',
    ]
      .map(command => {
        injects[command] = ['generated/globals', command];
        return `export const ${command} = global.${command}`;
      })
      .join(';')
);

const stylusProcessor = (content, id) =>
  new Promise((resolve, reject) => {
    var stylusOptions = {
      filename: id,
      compress: true,
    };

    if (process.env.prod) {
      stylusOptions.use = [
        autoprefixer({
          browsers: ['android 4.4', 'last 10 versions', 'iOS 7'],
        }),
      ];
    }
    const renderer = stylus(content, stylusOptions);
    renderer.render((err, code) => {
      if (err) {
        return reject(err);
      }
      code = `export default ${JSON.stringify(code)};`;
      resolve({ code, map: { mappings: '' } });
    });
  });

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

      ['@babel/proposal-pipeline-operator', { proposal: 'minimal' }],

      [
        './trace.js',
        {
          aliases,
        },
      ],
    ],
  }),

  inject(injects),

  {
    transform(content, id) {
      if (id.endsWith('.styl')) {
        return stylusProcessor(content, id);
      }
    },
  },
];
