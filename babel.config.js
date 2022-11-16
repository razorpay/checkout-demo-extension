module.exports = (api) => {
  api.cache(true);

  return {
    presets: [['@babel/preset-typescript']],
    plugins: [['@babel/plugin-transform-runtime']],
    env: {
      /**
       * Uncomment below preset if you would like to transpile
       * during development - for eg ie11 or older browser testing
       * note: this will increase compilation time
       */
      // development: {
      //   presets: [['@babel/preset-env', { debug: true }]],
      // },
      production: {
        presets: [['@babel/preset-env']],
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
