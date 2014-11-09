#Setup Instructions

1. Install grunt-cli (`npm install -g grunt-cli`)
2. Install harp (`npm install -g harp`)
3. Install npm supporting packages (`npm install`).
4. Run grunt (`grunt`) on the command line. It should generate a dist directory
5. Run harp (`harp server`) in `app` directory.
3. Open `localhost:9000/assets/layout.html` via http(s) in your browser. By default, we use the `api.razorpay.dev` endpoint.
4. Install karma, which we use for testing `npm install -g karma`.
5. Run `karma start` to run the unit tests in a phantomjs+chrome instance. You can choose which browsers to run the test cases in by passing them using the `--browsers flag`. Use `Chrome`, or `PhantomJS` (or both). Capitalization matters.

#Development Instructions
- All source code is kept inside the `app/assets` directory
- All unit tests are in test directory.
- Karma runs JSHint using settings from `.jshintrc` before running unit tests
- Karma directly loads the compiled files from the `app/dist` directory.
- See `karma.conf.js` for karma configuration, and `Gruntfile.js` for grunt configuration.
- `app/assets/layout.html` is used for configuring the minification and concat portion of grunt using the `usemin` package.
- All pushes to master are auto-deployed by wercker if the build succeeds(see `wercker.yml`).
