module.exports = (api) => {
  api.cache(true);

  return {
    plugins: [['@babel/plugin-transform-runtime']],
    env: {
      /**
       * Add this preset if you would like to transpile
       * during development - for eg ie11 or older browser testing
       * note: this will increase compilation time
       * ['@babel/preset-env', { debug: true }]
       */
      development: {
        presets: [['@babel/preset-typescript']],
      },
      production: {
        presets: [['@babel/preset-env'], ['@babel/preset-typescript']],
      },
      test: {
        plugins: ['svelte-inline-compile'],
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current',
              },
            },
          ],
        ],
      },
    },
  };
};
