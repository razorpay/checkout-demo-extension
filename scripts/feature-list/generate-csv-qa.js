const { parse, stringify } = require('csv/sync');
const { envs, methods, all } = require('./helper');
const { readFileSync, writeFileSync } = require('fs');

const input = readFileSync(__dirname + '/querybook-result.csv');

const records = parse(input);

const result = records
  .slice(1)
  .map((r) => {
    const featArray = r[0].split('-');

    // need to have 1 method
    if (featArray.find((a) => a < methods.length)) {
      // need to have 1 env
      if (
        featArray.find(
          (a) => a >= methods.length && a < methods.length + envs.length
        )
      ) {
        r[0] = featArray.map((i) => all[i] || 'unknown').join(' + ');
        return r;
      }
    }

    return null;
  })
  .filter(Boolean);

const csv = stringify(result);

writeFileSync(__dirname + '/result.csv', csv);
