const plugins = [
  [
    '@babel/plugin-transform-runtime',
    {
      regenerator: true,
    },
  ],
  [require('@babel/plugin-transform-spread'), { loose: false }],
];

module.exports = {
  runtimeHelpers: true,
  plugins,
  presets: [
    [
      require('@babel/preset-env'),
      {
        loose: true,
        targets: 'last 2 versions and not dead and >0.5%, ie >= 11',
      },
    ],
  ],
};
