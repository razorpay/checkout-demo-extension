const BINs = require('./bins');
const https = require('https');
const chai = require('chai');

const Banks = Object.keys(BINs);
const bank = process.argv[2];
const REGEXTESTER_KEY = 'rzpA2HiucjlUa';

if (!bank || !BINs[bank]) {
  console.log('Usage: node index.js <bank>');
  console.log('Supported banks:', Banks.join(', '));
  process.exit(1);
}

const bankBins = BINs[bank];
const baseRegex = `(${bankBins.join('|')})`;

const getOptimizedRegex = regex =>
  new Promise((resolve, reject) => {
    const data = {
      regex,
    };

    const options = {
      hostname: 'myregextester-api.netlify.com',
      port: 443,
      path: `/optimize?key=${REGEXTESTER_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, res => {
      if (res.statusCode !== 200) {
        return reject(res.statusCode);
      }

      res.on('data', d => {
        try {
          const json = JSON.parse(d.toString('utf8'));
          resolve(json);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.write(JSON.stringify(data));
    req.end();
  });

getOptimizedRegex(baseRegex)
  .then(({ regex }) => {
    const regexString = `^${regex.replace(/\?\:/g, '')}`;

    regex = new RegExp(regexString);

    const length = bankBins[0].length;
    const supported = Array(Math.pow(10, length))
      .fill(null)
      .map((_, i) => String(i).padStart(length, '0'))
      .filter(i => regex.test(i));

    supported.sort();
    bankBins.sort();

    try {
      chai.assert.deepEqual(supported, bankBins);
      console.log(regexString);
    } catch (err) {
      console.log('Generated regex does not match all BINs');
    }
  })
  .catch(err => {
    console.log('Failed to fetch regex', err);
  });
