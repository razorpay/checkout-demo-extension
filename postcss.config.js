const autoprefixer = require('autoprefixer');
module.exports = {
  plugins: [
    require('postcss-import'),
    autoprefixer({
      // todo - browser configuration needs to be referred from package.json browserlist targets
      overrideBrowserslist: ['android 4.4', 'last 10 versions', 'iOS 7'],
    }),
  ],
};
