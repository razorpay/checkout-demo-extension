[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

- [Setup Instructions](#setup-instructions)
- [Testing](#testing)
- [Keys](#keys)
- [Adding/removing new BINs for EMI Banks](#adding/removing-new-bins-for-emi-banks)

# Setup Instructions

This application runs on standalone node server in development environment.

- Repository Configuration

1. Copy `app/index.sample.html` -> `app/index.html`
1. Copy over `app/config.sample.js` -> `app/config.js` to specify API URL
1. `npm run build` to generate required assets/files for application initialization.

- Running Application

1. `npm run dev-start` to start development server with mock-api configuration.
1. `npm run live-start` to start development server with live(test) api configuration.
1. `npm run build` for production build

> Note: Run `npm run build` to generate required assets/files for application initialization (if any errors faced in dev server setup).

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

1. Add/remove BIN to/from [`scripts/emi/bins.js`](scripts/emi/bins.js), ensure that it is in a numerically sorted order.
2. `cd scripts/emi`
3. `node local.js <bank_code>`
4. Copy the regex and paste it in [`app/modules/common/bank.js`](app/modules/common/bank.js)

# post-merge hook

Add this as `.git/hooks/post-merge` and the execute `chmod +x .git/hooks/post-merge`. This will execute `npm install` if you pull a branch that has changes in `package-lock.json`.

```sh
#/usr/bin/env bash
# MIT © Sindre Sorhus - sindresorhus.com

# git hook to run a command after `git pull` if a specified file was changed
# Run `chmod +x post-merge` to make it executable then put it into `.git/hooks/`.

changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

check_run() {
	echo "$changed_files" | grep --quiet "$1" && eval "$2"
}

check_run package-lock.json "npm install"
```
