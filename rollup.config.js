let plugins = require('./rollup.plugins');

const modules = {
  tez: 'Tez',
  'templates/paymentMethodIcons/index': '_PaymentMethodIcons',
  'lib/color': 'Color',
  confirm: 'Confirm',
  callout: 'Callout',
  'entry/razorpay': 'Razorpay',
  'entry/checkout': 'Razorpay',
  'entry/checkout-frame': 'Razorpay',
  'checkoutframe/discreet': 'discreet',
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
