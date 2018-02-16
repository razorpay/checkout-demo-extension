let plugins = require('./rollup.plugins');

const modules = {
  eventer: 'Eventer',
  evthandler: 'EvtHandler',
  popup: 'Popup',
  authorize: 'Payment'
};

function getOptions(module) {
  return {
    input: `app/modules/${module}.js`,
    output: {
      file: `app/js/generated/${module}.js`,
      format: 'iife',
      name: modules[module]
    },
    plugins,

    // https://github.com/rollup/rollup-watch/issues/22
    watch: {
      exclude: 'node_modules/**'
    }
  };
}

module.exports = Object.keys(modules).map(m => getOptions(m));
