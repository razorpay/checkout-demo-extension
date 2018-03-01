const babel = require('rollup-plugin-babel');
const include = require('rollup-plugin-includepaths');

module.exports = [
  include({
    paths: ['app/modules']
  }),

  babel({
    include: 'app/modules/**/*.js',

    plugins: [
      'external-helpers',
      'transform-es2015-arrow-functions',
      'transform-es2015-block-scoped-functions',
      'transform-es2015-block-scoping',
      ['transform-es2015-computed-properties', { loose: true }],
      'transform-es2015-destructuring',
      'transform-es2015-parameters',
      'transform-es2015-shorthand-properties',
      'transform-es2015-spread',
      ['transform-es2015-template-literals', { loose: true }],
      'transform-object-rest-spread',
      'trace'
    ]
  })
];
