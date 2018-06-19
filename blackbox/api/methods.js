const fs = require('fs');
const path = require('path');

module.exports = fs
  .readdirSync(__dirname + '/methods')
  .reduce((methods, filename) => {
    methods[path.basename(filename, '.json')] = require('./methods/' +
      filename);
    return methods;
  }, {});
