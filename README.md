[![wercker status](https://app.wercker.com/status/1f8380cb72c916c46521d02d52e0174d/m "wercker status")](https://app.wercker.com/project/bykey/1f8380cb72c916c46521d02d52e0174d)

# Setup Instructions

1. Install gulp globally `npm install -g gulp`
1. Install npm supporting packages `npm install`
1. copy over `app/config.sample.js` -> `app/config.js` to specify API URL
1. Point local API to checkout in `public/checkout.php` and `app/views/checkout.php`
1. `gulp serve` in checkout root dir

# Gulp Commands

* Run `npm run build` or `gulp` to generate production build

# Testing

- Install `jre` and `phantomjs`
- `npm install -g selenium-standalone && selenium-standalone install`
- `selenium-standalone start`
- `gulp test` to run all tests
  - `gulp test:unit` to run unit tests
  - `gulp test:release` to run e2e tests

Tests are located in `test` folder. `test/release` folder contains blackbox tests`.


# Development Instructions
- All source code is kept inside the `app` directory
- All tests are in `test` directory.
- Default options for `new Razorpay`: `https://github.com/razorpay/checkout/blob/master/app/js/init.js`

# Deployment and Branches

`production`: [https://checkout.razorpay.com/](https://checkout.razorpay.com/) | Tested via [https://api.razorpay.com/test/livedemo.php](https://api.razorpay.com/test/livedemo.php) and [https://api.razorpay.com/test/checkout.php](https://api.razorpay.com/test/checkout.php)
`beta`: [https://betacheckout.razorpay.com/](https://betacheckout.razorpay.com/) | Tested via [https://beta.razorpay.com/test/layout.php](https://beta.razorpay.com/test/layout.php) and [https://beta.razorpay.com/test/checkout.php](https://beta.razorpay.com/test/checkout.php)

- For each new feature/bug fix/enhancement etc, make a new branch.
- Always branch out from `master`.
- Write code in your new branch. Deploy the branch to `beta` (until we get staging servers) when you need to test it on server. `beta` = `staging` server for now.

Once you have thoroughly tested your code
- merge `master` into your branch and fix any merge conflicts
- merge your branch into `master` and push.

- `master` should always be shippable. No merging partial code.
