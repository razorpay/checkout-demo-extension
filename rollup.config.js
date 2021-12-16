const { stylus, rollupCommon, getPlugins } = require('./cfu/rollup-plugins');
const livereload = require('rollup-plugin-livereload');

const plugins = getPlugins({
  src: ['app/modules/', 'node_modules/'],
}).concat(stylus);

if (process.env.NODE_ENV === 'dev') {
  plugins.push(
    livereload({
      watch: [
        'app/js/generated',
        'app/css/generated',
        'app/templates',
        'app/index.html',
        'app/checkout.html',
        'app/custom.html',
        'app/config.js',
        'app/sdk.js',
      ],
    })
  );
}

const modules = {
  'entry/razorpay': 'Razorpay',
  'entry/checkout': 'Razorpay',
  'entry/checkout-frame': 'Razorpay',
  'checkoutframe/discreet': 'discreet',
};

function getOptions(module) {
  return {
    ...rollupCommon,
    input: `app/modules/${module}.js`,
    output: {
      file: `app/js/generated/${module}.js`,
      format: 'iife',
      strict: false,
      name: modules[module],
    },
    plugins,
    onwarn: function (warning) {
      // Suppress "this is undefined" warning due to an issue in the
      // intl-messageformat module.
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        throw new Error('FIX CIRCULAR_DEPENDENCY');
      }
      console.error(warning.message);
    },
  };
}

module.exports = Object.keys(modules).map((m) => getOptions(m));
