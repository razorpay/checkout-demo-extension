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
