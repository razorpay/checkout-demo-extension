#!/usr/bin/env sh
#set -euo pipefail

cd /checkout
ls -la /checkout
apt-get update && apt-get install -y  g++ build-essential bzip2
npm install gulp
npm install jshint
npm install internal-ip
npm install internal-ip
npm install lazypipe
npm install coverage
npm install nodecoverage
npm install karma-coverage
npm install karma
npm install karma-cli
npm install karma-mocha-reporter
#npm install phantomjs-prebuilt
#npm install phamtomjs
#npm install phantomjs --phantomjs_cdnurl=https://bitbucket.org/ariya/phantomjs/downloads
npm install node-uuid
#npm install phantomjs --phantomjs_cdnurl=https://bitbucket.org/ariya/phantomjs/downloads
npm install phantomjs-prebuilt-that-works
#npm install phantomjs-prebuilt-that-works
npm install karma-phantomjs-launcher

gulp test:unit

gulp serve


