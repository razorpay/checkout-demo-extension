[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

- [Setup Instructions](#setup-instructions)
- [Testing](#testing)
- [Keys](#keys)
- [Adding/removing new BINs for EMI Banks](#adding/removing-new-bins-for-emi-banks)

# Setup Instructions

1. Copy `app/index.sample.html` -> `app/index.html`
1. copy over `app/config.sample.js` -> `app/config.js` to specify API URL
1. set up apache vhost using `httpd.sample.conf`. web root is `app` folder.
1. `npm i`
1. `npm start` for watching while development
1. `npm run build` for production build

# Testing

- Install chrome/chromium and set `CHROME_BIN` env var to chrome executable by including it in .bash_profile ( if not present already ).
- `npm test` to run unit tests, make production build and run blackbox tests.
- `npm run jest` to run all blackbox tests.
- `npm run jest blackbox/${path to test} --testTimeout=${time in ms}` to run a particular test.
  - eg. npm run jest blackbox/tests/card/offers.test.js --testTimeout=30000
- Set `headless` to true in [`jest-environment.js`](blackbox/jest-environment.js) to run future tests in headless mode.

Unit Tests are located in `test/unit` folder. `blackbox/sites` folder contains blackbox tests.

# Keys

Format: `key`, `merchant_id`

|                          | Fee Bearer: Merchant                                                                                                     | Fee Bearer: Customer                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Contact, Email mandatory | `rzp_test_VwsqHDsQPoVQi6`:`ChTb7rYever6Gaxsl0p5kHeN`, `C3eQwnbJGfsFP8`, `umang.galaiya+noneandmerc@razorpay.com`         | `rzp_test_BlUXikp98tvz4X`:`2gMzaeeKghLaSAs14H88XDoE`, `C3eojP6wt8Eg6t`, `umang.galaiya+noneandcust@razorpay.com`         |
| Contact, Email optional  | `rzp_test_QASMVC29cB5AUE`:`PPNJESjJGMZ4znxbjDVFwtJO`, `C3eVL7RBENDBuH`, `umang.galaiya+emailcontactandmerc@razorpay.com` | `rzp_test_HgCXAu6Ope0ezo`:`9ltnZhFUbb5fY8YRQzWofFXO`, `C3erKWTHygzR3Q`, `umang.galaiya+emailcontactandcust@razorpay.com` |
| Email optional           | `rzp_test_VAOkqOi642vGPu`:`iCATHzCwfW9YymjLHuoyvNND`, `C3ecol1Jvw7XpN`, `umang.galaiya+emailandmerc@razorpay.com`        | `rzp_test_rwcT7PeB3oKbmZ`:`KnyaaoZnQ1QtMwPLohpqYU3m`, `C3eyAbbHaNI4r8`, `umang.galaiya+emailandcust@razorpay.com`        |
| Contact optional         | `rzp_test_o39NWyo4QjBTFF`:`dYIJWsqDtp32ehrsuvYSCkty`, `C3f0WIVPfpzFQY`, `umang.galaiya+contactandmerc@razorpay.com`      | `rzp_test_w8HHg0qnClyj31`:`xtKzDTnkBpUXQVucKBHNhjAJ`, `C3f2I0QjbSUDjU`, `umang.galaiya+contactandcust@razorpay.com`      |

# Adding/removing new BINs for EMI Banks

### Semi-automated

1. Add/remove BIN to/from [`scripts/emi/bins.js`](scripts/emi/bins.js), ensure that it is in a numerically sorted order.
2. `cd scripts/emi`
3. `node index.js <bank_code>`
4. Copy the regex and paste it in [`app/modules/common/bank.js`](app/modules/common/bank.js)

### Manual

1. Generate a list of existing BINs using existing regex in [bank.js](https://github.com/razorpay/checkout/blob/master/app/modules/common/bank.js#L37) (See step 10 for list generation)
2. Append new BINs in that.
3. Make a simple Regex using:

   `simpleRegex = '(' + out.join('|') + ')'`

4. Go to [https://myregextester.com](https://myregextester.com)
5. Paste `simpleRegex` in match pattern & list of BINs in the "Source Text" field.
6. Check these:

   ![image](https://user-images.githubusercontent.com/11299391/57135808-56e13f80-6dc8-11e9-87eb-b6778da27c02.png)

7. Click Submit.
8. You'll see optimized Regex in `Optimized Match Pattern:`

   ![image](https://user-images.githubusercontent.com/11299391/57135853-75dfd180-6dc8-11e9-86a9-b54bd8ca8b1b.png)

9. Remove all `:?` (non-capturing symbols) from the regex.
10. Generating/Verifying all BINs against a RegExp:

    1. Open console, set your new regex:

       `r = /^(37(9(8(6[123789]|7[012678])|397)|693))/`

    2. Set out:

       `out = Array(1000000).fill(null).map((_, i) => String(i).padStart(6, '0')).filter(i => r.test(i));`

    You'll get an array of all BINs that match your new regex.
