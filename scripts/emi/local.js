const BINs = require('./bins');
const chai = require('chai');
const regexify = require('./regexify');

const Banks = Object.keys(BINs);
const bank = process.argv[2];

if (!bank || !BINs[bank]) {
  console.log('Usage: node index.js <bank>');
  console.log('Supported banks:', Banks.join(', '));
  process.exit(1);
}

const bankBins = BINs[bank];

const getOptimizedRegex = list =>
  Promise.resolve({
    regex: regexify(list),
  });

getOptimizedRegex(bankBins)
  .then(({ regex }) => {
    const regexString = `^${regex.replace(/\?\:/g, '').replace(/\\d/g, '')}`;

    regex = new RegExp(regexString);

    const length = bankBins[0].length;
    const shouldValidate = length <= 6;

    try {
      if (shouldValidate) {
        const supported = Array(Math.pow(10, length))
          .fill(null)
          .map((_, i) => String(i).padStart(length, '0'))
          .filter(i => regex.test(i));

        supported.sort();
        bankBins.sort();

        chai.assert.deepEqual(supported, bankBins);
      }
      console.log(regexString);
    } catch (err) {
      console.log('Generated regex does not match all BINs');
    }
  })
  .catch(err => {
    console.log('Failed to fetch regex', err);
  });
