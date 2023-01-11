const path = require('path');
const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default;
const sveltePreprocess = require('svelte-preprocess');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { everythingInPackage } = require('restrict-imports-loader');
const mockExpressApp = require('./mock-api/router');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const SvelteCheckPlugin = require('svelte-check-plugin');
const bodyParser = require('body-parser');
const TerserPlugin = require('terser-webpack-plugin');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');

/** @type {import('webpack').Configuration} */
exports.standardCheckoutEntry = {
  name: 'standard-checkout',
  entry: {
    checkout: './app/modules/entry/checkout.js',
    'checkout-frame': './app/modules/entry/checkout-frame.js',
    'checkout-frame-lite': './app/modules/entry/checkout-frame-lite.ts',
  },
};

/** @type {import('webpack').Configuration} */
exports.customCheckoutEntry = {
  name: 'custom-checkout',
  entry: {
    razorpay: './app/modules/entry/razorpay.js',
  },
};

/** @type {import('webpack').Configuration} */
exports.output = {
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'app', 'dist', 'v1'),
    chunkFilename: (pathData) => {
      return pathData.chunk.name
        ? `${pathData.chunk.runtime}-${pathData.chunk.name}-[id].js`
        : `${pathData.chunk.runtime}-[id].js`;
    },
  },
};

/** @type {import('webpack').Configuration} */
exports.resolveExtensions = {
  resolve: {
    extensions: ['...'],
  },
};

/** @type {import('webpack').Configuration} */
exports.resolveModules = {
  resolve: {
    modules: [path.resolve(__dirname, 'app', 'modules'), 'node_modules'],
  },
};

/**
 * Note: Compilation of files varies between development and production
 * In production, we enable babel-preset-env to transpile ie 11 compatible code
 * refer babel.config.js
 * @type {import('webpack').Configuration} */
exports.compile = {
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(m?js|ts|svelte)$/,
        exclude: {
          and: [/node_modules/], // Exclude libraries in node_modules ...
          not: [
            // Except for a few of them that needs to be transpiled because they use modern syntax
            /svelte/, // svelte is written in esm, we need to transpile it
            /svelte-i18n/,
          ],
        },
        use: [
          {
            /**
             * refer babel.config.js to check which preset/plugin is configured based on NODE_ENV
             */
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
        ],
      },
    ],
  },
};

/** @type {import('webpack').Configuration} */
exports.typescriptChecking = {
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: 'write-references',
      },
    }),
  ],
};

/** @type {import('webpack').Configuration} */
exports.svelteCheck = {
  plugins: [new SvelteCheckPlugin()],
};

/** @type {import('webpack').Configuration} */
exports.preventCircularDep = {
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
  ],
};

/** @type {import('webpack').Configuration} */
exports.analyze = {
  optimization: {
    concatenateModules: false,
  },
  plugins: [new StatoscopeWebpackPlugin()],
};

/**
 * https://github.com/sveltejs/svelte-loader
 * @type {(buildArgs) => import('webpack').Configuration}
 */
exports.svelte = (buildArgs) => ({
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.(svelte)$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: { enableSourcemap: true, dev: buildArgs.isDev },
            emitCss: true,
            preprocess: sveltePreprocess({
              sourceMap: true,
              postcss: true,
              /**
               * todo - Warning is shown because defaults is deprecated and will be removed in svelte v4.
               * Need to add lang=scss in all svelte files where scss is used And then remove defaults config below
               */
              defaults: { style: 'scss' },
            }),
          },
        },
      },
      {
        test: /\.css$/,
        include: /svelte\.\d+\.css/,
        use: [
          // required for sourcemap generation of svelte files
          buildArgs.isBuild ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false, // necessary if you use url('/path/to/some/asset.png|jpg|gif')
            },
          },
        ],
      },
      {
        // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
});

exports.css = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/checkout.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /svelte\.\d+\.css/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.styl$/,
        exclude: /svelte\.\d+\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'stylus-loader',
        ],
      },
    ],
  },
};

exports.compress = (buildArgs) => ({
  plugins: buildArgs.compress
    ? [
        new CompressionPlugin({
          test: /\.(js|css)$/,
          algorithm: 'gzip',
        }),
      ]
    : [],
});

/**
 * Custom checkout is pure JS sdk, which shouldn't depend on Svelte
 * having a single codebase it's very trivial to form a module dependency on svelte.
 * Using restriction loader, we can prevent svelte related imports in the module graph of custom checkout.
 * @type {import('webpack').Configuration}
 */
exports.restrictSvelteImport = {
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: [
          {
            loader: 'restrict-imports-loader',
            options: {
              severity: 'error',
              rules: [
                { restricted: everythingInPackage('svelte') },
                { restricted: /^svelte-i18n$/ },
              ],
            },
          },
        ],
      },
    ],
  },
};

/** @type {(buildArgs) => import('webpack').Configuration} */
exports.defineConstants = (buildArgs) => ({
  plugins: [
    new webpack.DefinePlugin({
      __BUILD_NUMBER__: process.env.BUILD_NUMBER || null,
      __GIT_COMMIT_HASH__: JSON.stringify(process.env.GIT_COMMIT_HASH) || null,
      // env is prod but traffic env can be production/canary/baseline
      __TRAFFIC_ENV__: JSON.stringify(process.env.TRAFFIC_ENV),
      __AUTOTEST_ANNOTATE__: JSON.stringify(
        buildArgs.isDev || process.env.AUTOTEST_ANNOTATE
      ),
    }),
  ],
});

/** @type {(buildArgs) => import('webpack').Configuration} */
exports.devServer = (buildArgs) => ({
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    devMiddleware: {
      writeToDisk: true,
    },
    allowedHosts: 'all',
    static: {
      directory: path.resolve(__dirname, 'app'),
    },
    port: 8000,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!buildArgs.proxyTarget) {
        devServer.app.use(bodyParser.json());
        devServer.app.use(
          bodyParser.urlencoded({
            extended: true,
            limit: '1mb',
            encoding: 'utf8', // Remove if you want a buffer
          })
        );
        devServer.app.use('/api', mockExpressApp);

        console.log(
          '\n\x1b[32m%s\x1b[0m\n',
          'Running local mock server using mock-api/mocks/'
        );
      }

      return middlewares;
    },
    proxy: buildArgs.proxyTarget
      ? {
          '/api': {
            target: process.env.API_SERVER,
            pathRewrite: { '^/api': '' },
            secure: false,
            changeOrigin: true,
          },
        }
      : {},
    watchFiles: [
      'app/index.html',
      'app/public.html',
      'app/checkout.html',
      'app/custom.html',
      'app/config.js',
      'app/sdk.js',
      buildArgs.proxyTarget ? '' : 'mock-api/mocks/**/*',
    ].filter(Boolean),
  },
});

/** @type {(buildArgs) => import('webpack').Configuration} */
exports.makeStandardCheckoutCopies = (buildArgs) => ({
  plugins: buildArgs.isBuild
    ? [
        new FileManagerPlugin({
          events: {
            onEnd: {
              copy: [
                {
                  source: './app/dist/v1/checkout.js',
                  destination: './app/dist/v1/checkout-1cc.js',
                },
                {
                  source: './app/dist/v1/checkout.js',
                  destination: './app/dist/v1/checkout-new.js',
                },
                {
                  source: './app/dist/v1/checkout-frame.js',
                  destination: './app/dist/v1/checkout-frame-new.js',
                },
              ],
            },
          },
        }),
      ]
    : [],
});

/** @type {(buildArgs) => import('webpack').Configuration} */
exports.makeCustomCheckoutCopies = (buildArgs) => ({
  plugins: buildArgs.isBuild
    ? [
        new FileManagerPlugin({
          events: {
            onEnd: {
              copy: [
                {
                  source: './app/dist/v1/razorpay.js',
                  destination: './app/dist/v1/razorpay-new.js',
                },
              ],
            },
          },
        }),
      ]
    : [],
});

/** @type {import('webpack').Configuration} */
exports.minimize = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          sourceMap: true,
          format: { comments: false },
          compress: {
            drop_console: true,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

/** @type {(buildArgs) => import('webpack').Configuration} */
exports.sourceMap = (buildArgs) => ({
  // https://webpack.js.org/configuration/devtool/
  devtool: buildArgs.isProd ? 'hidden-source-map' : 'source-map',
});

/** @type {import('webpack').Configuration} */
exports.persistentCache = (cacheName) => ({
  cache: {
    type: 'filesystem',
    name: cacheName,
    buildDependencies: {
      config: [
        path.resolve(__dirname, 'webpack.config.js'),
        path.resolve(__dirname, 'webpack.parts.js'),
        path.resolve(__dirname, 'babel.config.js'),
        path.resolve(__dirname, 'postcss.config.js'),
        path.resolve(__dirname, 'svelte.config.js'),
        path.resolve(__dirname, 'tsconfig.json'),
      ],
    },
  },
});

/** @type {import('webpack').Configuration} */
exports.retryAsyncChunks = {
  plugins: [new RetryChunkLoadPlugin({ maxRetries: 10, retryDelay: 200 })],
};
