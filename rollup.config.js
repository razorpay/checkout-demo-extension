let plugins = require('./rollup.plugins');

const modules = {
  eventer: 'Eventer',
  evthandler: 'EvtHandler',
  popup: 'Popup',
  authorize: 'Payment',
  tez: 'Tez',
  'lib/fetch': 'fetch',
  'lib/jsonp': 'jsonp',
  formatter: 'Formatter',
  confirm: 'Confirm',
  callout: 'Callout',
  'common/currency': 'Currency',
  'lib/_': '_',
  tracker: 'Track',
};

function getOptions(module) {
  return {
    input: `app/modules/${module}.js`,
    output: {
      file: `app/js/generated/${module}.js`,
      format: 'iife',
      strict: false,
      name: modules[module],
    },
    plugins,

    // https://github.com/rollup/rollup-watch/issues/22
    watch: {
      exclude: 'node_modules/**',
      clearScreen: false,
    },
  };
}

module.exports = Object.keys(modules).map(m => getOptions(m));
