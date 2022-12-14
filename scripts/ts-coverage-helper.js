/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

let jsFileCount = 0;
let tsFileCount = 0;
let jsFileCount1CC = 0;
let tsFileCount1CC = 0;

const checkValidFile = (fullPath, fileType) =>
  fullPath.endsWith(`.${fileType}`) &&
  !fullPath.endsWith(`.test.${fileType}`) &&
  !fullPath.endsWith(`.d.${fileType}`);

const traverseDir = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else {
      const isOneCC = fullPath.includes('one_click_checkout');
      if (checkValidFile(fullPath, 'js')) {
        isOneCC ? jsFileCount1CC++ : jsFileCount++;
      } else if (checkValidFile(fullPath, 'ts')) {
        isOneCC ? tsFileCount1CC++ : tsFileCount++;
      }
    }
  });
};
traverseDir('app/modules');

const calcTSCoverage = (tsFileCount, jsFileCount) =>
  `${((tsFileCount / (jsFileCount + tsFileCount)) * 100).toFixed(2)}%`;

const checkoutTSCoverage = calcTSCoverage(tsFileCount, jsFileCount);
const oneCCTSCoverage = calcTSCoverage(tsFileCount1CC, jsFileCount1CC);

module.exports = { checkoutTSCoverage, oneCCTSCoverage };
