#Setup Instructions

1. Install grunt-cli (`npm install -g grunt-cli`)
2. Install harp (`npm install -g harp`)
3. Install npm supporting packages (`npm install`).
5. Run harp (`harp server`) in `app/assets` directory.
3. Open `localhost:9000/assets/layout.html` via http(s) in your browser. By default, we use the `api.razorpay.dev` endpoint.
4. Install karma, which we use for testing `npm install -g karma-cli`.

#Grunt Commands

1. `grunt` or `grunt build` create a build
1. `grunt test` builds checkout.js and runs tests
1. `grunt test:watch` runs tests when a file changes in `app/assets/js/**.*` or `test/*.js`
1. `grunt test:prepare` is not needed by devs. Wercker runs it before tests and grunt internally utilizes it.

#Development Instructions
- All source code is kept inside the `app/assets` directory
- All unit tests are in test directory.
- Karma runs JSHint using settings from `.jshintrc` before running unit tests
- Karma loads `./tmp/checkout.built.js` which is built whenever `grunt test` or `grunt test:watch` runs.
- See `karma.conf.js` for karma configuration, and `Gruntfile.js` for grunt configuration.
- `app/assets/layout.html` is used for configuring the minification and concat portion of grunt using the `usemin` package.
- All pushes to master are auto-deployed by wercker if the build succeeds(see `wercker.yml`).
- If you have to ignore any specific jshint warning in a particular file put `/* jshint -<CODE> */` at the top of the file where code can be obtained from https://github.com/jshint/jshint/blob/master/src/messages.js
