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

#Deployment and Branches

`production`: [https://checkout.razorpay.com/](https://checkout.razorpay.com/) | Tested via [https://api.razorpay.com/test/layout.php](https://api.razorpay.com/test/layout.php) and [https://api.razorpay.com/test/checkout.php](https://api.razorpay.com/test/checkout.php)
`beta`: [https://betacheckout.razorpay.com/](https://betacheckout.razorpay.com/) | Tested via [https://beta.razorpay.com/test/layout.php](https://beta.razorpay.com/test/layout.php) and [https://beta.razorpay.com/test/checkout.php](https://beta.razorpay.com/test/checkout.php)

- For each new feature/bug fix/enhancement etc, make a new branch.
- *Always branch out from `development`*.
- Write code in your new branch. Deploy the branch to `beta` (until we get staging servers) when you need to test it on server. `beta` = `staging` server for now.

Once you have thoroughly tested your code
- merge `development` into your branch and fix any merge conflicts
- merge your branch into `development` and push.

Some developer with write access to `master` will merge it and deploy to `production` in next cycle.

- `development`: This branch will contain all the code that is ready to be shipped. This branch should always be shippable. No merging partial code.
- `master`: Only few devs will have write access to master. This will always contain code that is deployed to `production`.
