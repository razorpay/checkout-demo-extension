const { parse, stringify } = require('csv/sync');
const { all } = require('./helper');
const { readFileSync, writeFileSync } = require('fs');

const input = readFileSync(__dirname + '/querybook-result.csv');

const records = parse(input);

const result = records.slice(1).map((r) => {
  r[0] = r[0]
    .split('-')
    .map((i) => all[i] || 'unknown')
    .join(' + ');
  return r;
});

const csv = stringify(result);

writeFileSync(__dirname + '/result.csv', csv);
