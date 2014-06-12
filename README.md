#Setup Instructions

1. Install grunt-cli (`npm install -g grunt-cli`)
2. Install npm supporting packages (`npm install`).
2. Run grunt (`grunt`) on the command line. It should generate a dist directory
3. Open `index.html` via http(s) in your browser. By default, we use the `api.razorpay.com` endpoint. Currently, the endpoint is configurable by editing `razorpay.js` but that should change in the future.
4. Install karma, which we use for testing `npm install -g karma`.
5. Run `karma start` to run the unit tests in a phantomjs instance

#Development Instructions
- All source code is kept inside the `src` directory
- All unit tests are in test directory
- Karma runs JSHint using settings from `.jshintrc` before running unit tests
- Karma directly loads the compiled files from the `dist` directory, so you need to save files, and then run `grunt` again to get karma to re-run tests.
- See `karma.conf.js` for karma configuration, and `Gruntfile.js` for grunt configuration.
- `layout.html` is used for configuring the minification and concat portion of grunt using the `usemin` package.
- All pushes to master are auto-deployed by wercker if the build succeeds(see `wercker.yml`).
