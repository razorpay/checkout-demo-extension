[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# Setup Instructions

1. copy over `app/config.sample.js` -> `app/config.js` to specify API URL
1. set up apache vhost using `httpd.sample.conf`. web root is `app` folder.
1. `npm i`
1. `npm start` for watching while development
1. `npm run build` for production build

# Testing

- Install chrome/chromium and set `CHROME_BIN` env var to chrome executable.
- `npm test` to run unit tests, make production build and run blackbox tests.
- `node blackbox` to run all blackbox tests in headless mode.
- `node blackbox ${test}` to just run a particular test without headless.
  - e.g. `node blackbox card`

Unit Tests are located in `test/unit` folder. `blackbox/sites` folder contains blackbox tests.

# Keys

Format: `key`, `merchant_id`

|                          | Fee Bearer: Merchant                        | Fee Bearer: Customer                        |
| ------------------------ | ------------------------------------------- | ------------------------------------------- |
| Contact, Email mandatory | `rzp_test_vmE2wuJIilTJ0s`, `C3eQwnbJGfsFP8` | `rzp_test_GSajCRZqUgVOnU`, `C3eojP6wt8Eg6t` |
| Contact, Email optional  | `rzp_test_T0nKPeet5kTnbj`, `C3eVL7RBENDBuH` | `rzp_test_t4K8kziR0wYxxP`, `C3erKWTHygzR3Q` |
| Email optional           | `rzp_test_DvDrkPcFCkPd8S`, `C3ecol1Jvw7XpN` | `rzp_test_aiMriDRpaBThmc`, `C3eyAbbHaNI4r8` |
| Contact optional         | `rzp_test_FWEjUCmU2aT5x6`, `C3f0WIVPfpzFQY` | `rzp_test_wWHBq3b8ESXpmB`, `C3f2I0QjbSUDjU` |

# Adding new IINs for EMI Banks

### Semi-automated

1. Add BIN to [`scripts/emi/bin.js`](scripts/emi/bin.js), ensure that it is in a numerically sorted order.
2. `cd scripts/emi`
3. `node index.js <bank_code>`
4. Copy the regex and paste it in [`app/modules/common/bank.js`](app/modules/common/bank.js)

### Manual

1. Generate a list of existing IINs using existing regex in [bank.js](https://github.com/razorpay/checkout/blob/master/app/modules/common/bank.js#L37) (See step 10 for list generation)
2. Append new IINs in that.
3. Make a simple Regex using:

   `simpleRegex = '(' + out.join('|') + ')'`

4. Go to [https://myregextester.com](https://myregextester.com)
5. Paste `simpleRegex` in match pattern & list of IINs in the "Source Text" field.
6. Check these:

   ![image](https://user-images.githubusercontent.com/11299391/57135808-56e13f80-6dc8-11e9-87eb-b6778da27c02.png)

7. Click Submit.
8. You'll see optimized Regex in `Optimized Match Pattern:`

   ![image](https://user-images.githubusercontent.com/11299391/57135853-75dfd180-6dc8-11e9-86a9-b54bd8ca8b1b.png)

9. Remove all `:?` (non-capturing symbols) from the regex.
10. Generating/Verifying all IINs against a RegExp:

    1. Open console, set your new regex:

       `r = /^(37(9(8(6[123789]|7[012678])|397)|693))/`

    2. Set out:

       `out = Array(1000000).fill(null).map((_, i) => String(i).padStart(6, '0')).filter(i => r.test(i));`

    You'll get an array of all IINs that match your new regex.
