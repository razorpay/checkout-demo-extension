const { stylus, rollupCommon, getPlugins } = require('fe/rollup-plugins');
const plugins = getPlugins({ src: 'app/modules' }).concat(stylus);

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
  };
}

module.exports = Object.keys(modules).map(m => getOptions(m));
