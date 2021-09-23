#!/usr/bin/env node
const { lintLog, lintCompat } = require('./eslint');

console.log(process.argv);

lintLog(lintCompat.executeOnFiles(process.argv.slice(2)));
