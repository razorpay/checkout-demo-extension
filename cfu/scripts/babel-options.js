module.exports = {
  plugins: [
    [
      require('@babel/plugin-proposal-pipeline-operator'),
      { proposal: 'minimal' },
    ],
  ],
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
