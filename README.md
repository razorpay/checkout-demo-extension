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
    + e.g. `node blackbox card`

Unit Tests are located in `test/unit` folder. `blackbox/sites` folder contains blackbox tests.
