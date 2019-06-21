const BINs = require('./bins');
const querystring = require('querystring');
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

function findOptimizedRegexFromHtml(body) {
  body = body.replace(/\n/g, ''); // Replace line-breaks

  const OPTIMIZED_PATTERN_REGEX = /<u>Optimized Match Pattern\:<\/u><br \/><span style="color:#000066;">(.*?)<br /;
  const matches = body.match(OPTIMIZED_PATTERN_REGEX);

  const found = matches[1];

  if (!found) {
    return;
  }

  return found.replace(/<wbr>/g, '');
}

const getOptimizedRegex = regex =>
  new Promise((resolve, reject) => {
    const data = {
      match: regex,
      cb_showarray: 'yes',
      cb_optimize: 'yes',
      'cb_lang[]5': 'js',
      dd_oper: 'match_all',
      dd_delim: '/',
      submit: 'Submit',
    };

    const options = {
      hostname: 'myregextester.com',
      port: 443,
      path: `/index.php`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const req = https.request(options, res => {
      if (res.statusCode !== 200) {
        return reject(res.statusCode);
      }

      let chunks = [];

      res.on('data', chunk => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks);
        const html = body.toString();
        const foundRegex = findOptimizedRegexFromHtml(html);

        if (foundRegex) {
          resolve({
            regex: foundRegex,
          });
        } else {
          reject();
        }
      });
    });

    req.write(querystring.stringify(data));
    req.end();
  });

getOptimizedRegex(baseRegex)
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
