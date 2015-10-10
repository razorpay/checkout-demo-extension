[![wercker status](https://app.wercker.com/status/1f8380cb72c916c46521d02d52e0174d/m "wercker status")](https://app.wercker.com/project/bykey/1f8380cb72c916c46521d02d52e0174d)

#Setup Instructions

1. Install gulp globally `npm install -g gulp`
1. Install npm supporting packages `npm install`
1. `gulp watch`
1. Open `app` directory via any web server in your browser

Testing:
1. `gulp test` for running karma based tests
1. tests are located in `test/inline` folder

#Gulp Commands

* `gulp` creates production build

#Development Instructions
- All source code is kept inside the `app` directory
- All unit tests are in `test` directory.
- Default options for `new Razorpay`: `https://github.com/razorpay/checkout/blob/master/app/js/base.js`

#Deployment and Branches

`production`: [https://checkout.razorpay.com/](https://checkout.razorpay.com/) | Tested via [https://api.razorpay.com/test/livedemo.php](https://api.razorpay.com/test/livedemo.php) and [https://api.razorpay.com/test/checkout.php](https://api.razorpay.com/test/checkout.php)
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