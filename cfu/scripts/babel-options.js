const plugins = [
  [
    require('@babel/plugin-proposal-pipeline-operator'),
    { proposal: 'minimal' },
  ],
  [require('@babel/plugin-transform-spread'), { loose: false }],
];

module.exports = {
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
