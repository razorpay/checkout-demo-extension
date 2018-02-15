let plugins = require('./rollup.plugins');

const files = ['eventer'];

function getOptions(input, file) {
  return {
    input,
    output: {
      file,
      format: 'iife',
      name: 'self'
    },
    plugins,

    // https://github.com/rollup/rollup-watch/issues/22
    watch: {
      exclude: 'node_modules/**'
    }
  };
}

module.exports = files.map(file =>
  getOptions(`app/modules/${file}.js`, `app/js/generated/${file}.js`)
);
