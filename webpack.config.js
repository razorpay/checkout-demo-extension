const { merge } = require('webpack-merge');
const parts = require('./webpack.parts');

const common = (buildArgs) =>
  merge([
    parts.output,
    parts.resolveModules,
    parts.resolveExtensions,
    parts.compile,
    parts.typescriptChecking,
    parts.preventCircularDep,
    parts.defineConstants(buildArgs),
    parts.sourceMap(buildArgs),
    parts.retryAsyncChunks,
  ]);

const commonDevelopment = merge([]);

const commonProduction = merge([
  parts.minimize,
  // parts.analyze, // uncomment this to run statoscope analyzer
  // parts.compress, // uncomment this to generate brotli files via webpack
]);

const standardCheckout = (buildArgs) =>
  merge([
    common(buildArgs),
    parts.standardCheckoutEntry,
    parts.css,
    parts.svelte(buildArgs),
    // parts.svelteCheck,
    parts.makeStandardCheckoutCopies(buildArgs),
    parts.persistentCache(`standard-checkout-${buildArgs.mode}`),
  ]);

const standardCheckoutDevelopment = (buildArgs) =>
  merge([commonDevelopment, parts.devServer(buildArgs)]);

const customCheckout = (buildArgs) =>
  merge([
    common(buildArgs),
    parts.customCheckoutEntry,
    parts.makeCustomCheckoutCopies(buildArgs),
    parts.persistentCache(`custom-checkout-${buildArgs.mode}`),
    // parts.restrictSvelteImport,
  ]);

const customCheckoutDevelopment = merge([commonDevelopment]);

function makeBuildArgs(args) {
  return {
    mode: args.mode,
    isDev: args.mode === 'development',
    isProd: args.mode !== 'development',
    isBuild: args.env.WEBPACK_BUILD === true,
    proxyTarget: process.env.API_SERVER,
  };
}

module.exports = (_, args) => {
  const buildArgs = makeBuildArgs(args);

  // eslint-disable-next-line no-console
  console.log({ buildArgs });

  const config = {
    development: [
      merge([
        standardCheckout(buildArgs),
        standardCheckoutDevelopment(buildArgs),
      ]),
      merge([customCheckout(buildArgs), customCheckoutDevelopment]),
    ],
    production: [
      merge([standardCheckout(buildArgs), commonProduction]),
      merge([customCheckout(buildArgs), commonProduction]),
    ],
  };

  return config[buildArgs.mode];
};
