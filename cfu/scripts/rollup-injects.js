const fs = require('fs');
const globalContents = fs
  .readFileSync(__dirname + '/../src/fe/implicit/global.js')
  .toString();

const globalInjects = globalContents
  .match(/export const ([^ =]+)/g)
  .map((a) => a.slice(13));

let injects = {
  // this is rollup option, not an inject
  include: ['**/*.js', '**/*.ts', '**/*.svelte'],

  // injects
  _: ['fe/implicit/_', '*'],
};

globalInjects.forEach((g) => {
  injects[g] = ['fe/implicit/global', g];
});

module.exports = injects;
