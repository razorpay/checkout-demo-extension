const { rollupCommon, getPlugins } = require('./cfu/rollup-plugins');
const livereload = require('rollup-plugin-livereload');
// const production = process.env.NODE_ENV === 'production' || process.env.prod;

const plugins = getPlugins({
  src: ['app/modules/', 'node_modules/'],
});

if (process.env.NODE_ENV === 'dev') {
  plugins.push(
    livereload({
      watch: [
        'app/dist/v1/',
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
  'entry/razorpay': 'razorpay',
  'entry/checkout': 'checkout',
  'entry/checkout-frame': 'checkout-frame',
};

function getOptions(module) {
  return {
    ...rollupCommon,
    input: `app/modules/${module}.js`,
    output: {
      file: `app/dist/v1/${modules[module]}.js`,
      format: 'iife',
      strict: false,
      name: 'Razorpay',
      sourcemap: true,
    },
    plugins,
    onwarn: function (warning) {
      // Suppress "this is undefined" warning due to an issue in the
      // Supress typescript warning because of pipeline operator
      // intl-messageformat module.
      if (
        warning.code === 'THIS_IS_UNDEFINED' ||
        warning.pluginCode === 'TS1109'
      ) {
        return;
      }
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        console.error(warning); // need dependency chain, hence log whole object
        throw new Error('FIX CIRCULAR_DEPENDENCY');
      }
      console.error(warning.message);
    },
  };
}

const entryPoint = Object.keys(modules);
const buildConfig = entryPoint.map((m) => getOptions(m));
module.exports = buildConfig;
