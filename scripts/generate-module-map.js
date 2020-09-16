const rollupConfig = require('../rollup.config');
const rollup = require('rollup');
const fs = require('fs');
const path = require('path');

Promise.all(
  rollupConfig.map(config => {
    return rollup.rollup(config).then(bundle => {
      const data = {};
      const entryPath = path.relative('.', config.input);
      bundle.cache.modules.forEach(module => {
        data[path.relative('.', module.id)] = module.dependencies.map(module =>
          path.relative('.', module)
        );
      });
      return bundle.write(config).then(() => {
        return { entry: entryPath, map: data };
      });
    });
  })
).then(allEntries => {
  fs.writeFileSync('./module-map.json', JSON.stringify(allEntries, null, 2));
  console.log('written to ./module-map.json');
});
