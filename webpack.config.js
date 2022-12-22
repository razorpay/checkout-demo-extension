const { merge } = require('webpack-merge');
const parts = require('./webpack.parts');

/**
 * Common configs applicable to all entry points
 */

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

const commonProduction = (buildArgs) =>
  merge([
    parts.minimize,
    parts.compress(buildArgs),
    // parts.analyze, // uncomment this to run statoscope analyzer
  ]);

/**
 * Standard checkout related configs
 */

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

const standardCheckoutProduction = (buildArgs) =>
  merge([commonProduction(buildArgs)]);

/**
 * Custom checkout related configs
 */

const customCheckout = (buildArgs) =>
  merge([
    common(buildArgs),
    parts.customCheckoutEntry,
    parts.makeCustomCheckoutCopies(buildArgs),
    parts.persistentCache(`custom-checkout-${buildArgs.mode}`),
    // parts.restrictSvelteImport,
  ]);

const customCheckoutDevelopment = merge([commonDevelopment]);

const customCheckoutProduction = (buildArgs) =>
  merge([commonProduction(buildArgs)]);

/**
 * Build Args Utils
 */

function makeBuildArgs(args) {
  return {
    mode: args.mode,
    isDev: args.mode === 'development',
    isProd: args.mode !== 'development',
    isBuild: args.env.WEBPACK_BUILD === true,
    proxyTarget: process.env.API_SERVER,
    compress: process.env.COMPRESS === '1',
  };
}

/**
 * Final webpack config exported
 */

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
      merge([
        standardCheckout(buildArgs),
        standardCheckoutProduction(buildArgs),
      ]),
      merge([customCheckout(buildArgs), customCheckoutProduction(buildArgs)]),
    ],
  };

  return config[buildArgs.mode];
};
