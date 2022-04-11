const typescript = require('@rollup/plugin-typescript');
const argv = require('yargs-parser')(process.argv.slice(2));
const globals = require('./scripts/rollup-injects');
const include = require('rollup-plugin-includepaths');
const babelOptions = require('./scripts/babel-options');
const babelPlugin = require('rollup-plugin-babel');
// const babel = require('@babel/core');
const stylus = require('./scripts/rollup-plugin-stylus');
const svelte = require('rollup-plugin-svelte');
const inject = require('rollup-plugin-inject');
const replace = require('rollup-plugin-replace');
const resolve = require('@rollup/plugin-node-resolve');
const pCSS = require('rollup-plugin-css-only');
const preprocess = require('svelte-preprocess');
const eslint = require('./scripts/eslint');
const isProd = require('./prod');
const { readFile } = require('fs');
const { dirname } = require('path');

const isWatching = argv.w || argv.watch;

const commonFeDir = './cfu/src';

const resolveSrc = (importerFile, srcPath) =>
  resolve(dirname(importerFile), srcPath);

const getSrcContent = (file) =>
  new Promise((resolve, reject) => {
    readFile(file, (error, data) => {
      if (error) reject(error);
      else resolve(data.toString());
    });
  });

const parseFile = async ({ attributes, filename, content }) => {
  const dependencies = [];
  if (attributes.src) {
    /** Ignore remote files */
    if (!attributes.src.match(/^(https?)?:?\/\/.*$/)) {
      const file = resolveSrc(filename, attributes.src);
      content = await getSrcContent(file);
      dependencies.push(file);
    }
  }

  return {
    filename,
    attributes,
    content,
    dependencies,
  };
};

const getPlugins = ({ lint = true, src }) => {
  if (!Array.isArray(src)) {
    src = [src];
  }
  const paths = src.concat(commonFeDir, 'node_modules');

  if (lint) {
    eslint.lint(isWatching)(paths);
  }

  // Order of plugins is important:
  // svelte needs to be before babel so that by the time
  // babel is run, svelte has become JS
  return [
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    // __CANARY_PERCENTAGE__ : don't set null on default, pass as is
    // isNaN(null) gives true, hence isNaN(parseInt()) is used
    replace({
      __BUILD_NUMBER__: process.env.BUILD_NUMBER || null,
      __CANARY_PERCENTAGE__: process.env.CANARY_PERCENTAGE,
      // env is prod but traffic env can be production/canary/baseline
      __TRAFFIC_ENV__: process.env.TRAFFIC_ENV,
      __SIFT_BEACON_KEY__: JSON.stringify('4dbbb1f7b6'),
      __CYBER_SOURCE_RZP_ORG_ID__: JSON.stringify('1snn5n9w'),
    }),
    typescript({ sourceMap: !isProd }),

    include({
      paths,
      extensions: ['.mjs', '.js'],
    }),

    svelte({
      extensions: ['.svelte'],
      preprocess: [
        preprocess({ defaults: { style: 'scss' } }),
        {
          script: async (svelteFile) => {
            setTimeout(() => eslint.lint(false)([svelteFile.filename]));

            const { content, dependencies } = await parseFile(svelteFile);

            return {
              code: content,
              dependencies,
            };
          },
        },
      ],
    }),

    pCSS({
      output: 'svelte.styl',
    }),

    babelPlugin({
      ...babelOptions,
      extensions: ['.js', '.mjs', '.svelte'],
    }),

    inject(globals),
  ];
};

const rollupCommon = {
  treeshake: {
    propertyReadSideEffects: false,
  },
};

if (isWatching) {
  rollupCommon.watch = {
    // https://github.com/rollup/rollup-watch/issues/22
    exclude: 'node_modules/**',
    chokidar: true,
    clearScreen: false,
  };
}

module.exports = {
  stylus,
  isWatching,
  rollupCommon,
  getPlugins,
};
