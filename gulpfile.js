const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const dot = require('./scripts/dot/index');
const glob = require('glob');
const plumber = require('gulp-plumber');
const stylus = require('gulp-stylus');
const stylint = require('gulp-stylint');
const autoprefixer = require('autoprefixer-stylus');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');
const through = require('through2').obj;
const runSequence = require('run-sequence');
const execSync = require('child_process').execSync;
const KarmaServer = require('karma').Server;
const webdriver = require('gulp-webdriver');
const testServer = require('./test/e2e/server/index.js');
const internalIp = require('internal-ip');
const lazypipe = require('lazypipe');
const minimist = require('minimist');

const distDir = 'app/dist/v1/';
const cssDistDir = distDir + 'css';

function assetPath(path) {
  return `app/${path}`;
}

let paths = {
  js: assetPath('js/**/*.js'),
  templates: assetPath('_templates/**/*.jst'),
  css: assetPath('css/**/*.styl'),
  images: assetPath('images/**/*'),
  fonts: assetPath('fonts/**/*')
};

gulp.task('clean', () => execSync(`rm -rf ${distDir}`));

gulp.task('compileTemplates', function() {
  execSync('mkdir -p app/templates');
  dot.process({
    path: 'app/_templates',
    destination: assetPath('templates'),
    global: 'templates'
  });
});

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

const stylusOptions = {
  use: [
    autoprefixer({
      browsers: ['ie 8', 'android 2.2', 'last 10 versions', 'iOS 7']
    })
  ]
};

gulp.task('css', () => {
  return gulp
    .src('app/checkout.styl')
    .pipe(stylint())
    .pipe(stylint.reporter())
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(stylus(stylusOptions))
    .pipe(gulp.dest(cssDistDir));
});

gulp.task('css:prod', () => {
  return gulp
    .src('app/checkout.styl')
    .pipe(stylint())
    .pipe(stylus(Object.assign({}, stylusOptions, { compress: true })))
    .pipe(gulp.dest(cssDistDir));
});

gulp.task('usemin', () => {
  return gulp
    .src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(
      through(function(file, enc, cb) {
        file.contents = new Buffer(`(function(){${String(file.contents)}})()`);
        this.push(file);
        cb();
      })
    )
    .pipe(gulp.dest(distDir));
});

gulp.task('uglify', () => {
  return (
    gulp
      .src([`${distDir}/**/*.js`])
      // wrap between iife and user strict
      .pipe(
        through(function(file, enc, cb) {
          file.contents = new Buffer(
            `(function(){"use strict";${String(file.contents)}})()`
          );
          this.push(file);
          cb();
        })
      )
      .pipe(uglify())
      .pipe(gulp.dest(distDir))
  );
});

gulp.task('copyLegacy', function() {
  execSync(
    `cd ${distDir}; rm *-new.js; for i in *.js; do cp $i $(basename $i .js)-new.js; done;`
  );
});

gulp.task('copyConfig', () =>
  execSync(`cp ${assetPath('config.js')} ${distDir}`)
);

gulp.task('compileHTML', function() {
  runSequence('usemin', 'uglify', 'copyLegacy');
});

gulp.task('staticAssets', function() {
  return gulp
    .src([paths.images, paths.fonts], { base: 'app' })
    .pipe(gulp.dest(`${distDir}`));
});

gulp.task('build', function(cb) {
  runSequence(
    'clean',
    ['css:prod', 'compileTemplates'],
    'compileHTML',
    'staticAssets',
    cb
  );
});

gulp.task('serve', ['build'], function() {
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.templates, ['compileTemplates']);
  gulp.watch(paths.js, [/*'hint',*/ 'usemin']);
  gulp.watch(assetPath('*.html'), ['usemin']);
});

gulp.task('watch', ['serve']);
gulp.task('default', ['build']);

/**  Tests  **/

function getJSPaths(html, pattern) {
  try {
    return execSync(
      'cat ' + html + ' | grep -F "' + pattern + '" | cut -d\'"\' -f2',
      { encoding: 'utf-8' }
    )
      .split('\n')
      .filter(function(path) {
        return !!path;
      })
      .map(function(path) {
        return assetPath(path);
      });
  } catch (e) {
    console.log(e.message);
    return [];
  }
}

let allOptions;
let karmaOptions = {
  frameworks: ['mocha'],
  reporters: ['coverage'],
  port: 9876,
  colors: true,
  logLevel: 'ERROR',
  browsers: ['ChromeHeadlessNoSandbox'],
  customLaunchers: {
    ChromeHeadlessNoSandbox: {
      base: 'ChromiumHeadless',
      flags: ['--no-sandbox']
    }
  },
  singleRun: true,
  coverageReporter: {
    type: 'json'
  },
  preprocessors: {}
};

let reporter = 'mocha';
karmaOptions.reporters.push(reporter);

let karmaLibs = [
  'spec/jquery-1.11.1.js',
  'spec/sendkeys.js',
  'spec/sinon.js',
  'spec/expect.js',
  'spec/helpers.js'
];

gulp.task('makeKarmaOptions', ['build'], function() {
  allOptions = glob.sync(assetPath('!(custom).html')).map(function(html) {
    let o = JSON.parse(JSON.stringify(karmaOptions));
    o.files = karmaLibs.concat(getJSPaths(html, '<script src='));

    // adding paths to cover
    getJSPaths(html, '<!--coverage-->').forEach(function(path) {
      o.preprocessors[path] = ['coverage'];
    });
    o.coverageReporter.dir =
      'coverage' + html.replace(/^[^\/]+|\.[^\.]+$/g, '');

    return o;
  });
});

// unit tests + coverage
gulp.task('test:unit', ['makeKarmaOptions'], function(done) {
  setTimeout(function() {
    testFromStack(0, allOptions, done);
  }, 1000);
});

function testFromStack(counter, allOptions, done) {
  new KarmaServer(allOptions[counter], function(exitCode) {
    if (exitCode !== 0) {
      process.exit(1);
    }
    if (allOptions[++counter]) {
      testFromStack(counter, allOptions, done);
    } else {
      allOptions = null;
      // createCoverageReport();
      done();
    }
  }).start();
}

function createCoverageReport() {
  let collector = new istanbul.Collector();
  let reporter = new istanbul.Reporter(false, 'coverage/final');

  glob.sync('coverage/**/coverage-final.json').forEach(function(jsonFile) {
    collector.add(require('./' + jsonFile));
  });

  reporter.add('lcovonly');
  reporter.addAll(['clover', 'cobertura']);
  reporter.add('html');
  reporter.write(collector, true, function() {});
  console.log('Report created in coverage/final');
}

/***** E2E/Acceptance tests *****/

gulp.task('e2e:run', function(done) {
  return gulp
    .src('./wdio.conf.js')
    .pipe(
      webdriver({
        baseUrl: `http://${internalIp.v4()}:3000`
      })
    )
    .on('error', function() {
      done();
    });
});

gulp.task('symlinkDist', () => {
  var target = 'test/e2e/server/public/dist/';
  var dist = Array(target.split('/').length).join('../') + distDir;
  execSync(`rm -rf ${target}; mkdir ${target}; ln -s ${dist} ${target}/v1`);
});

let testServerInstance;

gulp.task('testserver:start', () => {
  testServerInstance = testServer.listen(3000, function(error) {
    if (error) {
      console.error(`exec error: ${error}`);
      process.exit(1);
    }
  });
});

gulp.task('testserver:stop', () => {
  testServerInstance.close();
});

gulp.task('test:e2e', cb => {
  runSequence(
    'build',
    'symlinkDist',
    'testserver:start',
    'e2e:run',
    'testserver:stop',
    cb
  );
});

gulp.task('test', () => runSequence('test:unit', 'test:e2e'));

const argv = minimist(process.argv.slice(1));
gulp.task('custom', ['build'], () => {
  var api = argv.api
    ? argv.api.replace(/(.)\/?$/, '$1/')
    : 'https://api.razorpay.com/';
  var prefix = `
  Razorpay = {
    config: {
      frame: document.currentScript.src.replace(/\\\\/[^\\\\/]+$/, "/custom.html"),
      frameApi: "${api}"
    }
  }
  `.replace(/\s/g, '');

  execSync(
    `
            cd app
            mkdir -p custom
            cp dist/v1/{checkout,checkout-frame}.js custom
            sed -i '1i${prefix}' custom/*.js
            cp dist/v1/css/checkout.css custom
            cp custom.html custom/
          `
  );
  console.log('files generated at app/custom');
  if (argv.host) {
    console.log(`uploading to ${argv.host}`);
    execSync(
      `
              rsync app/custom/* ${argv.host}
              rm -r app/custom
            `
    );
  }
});
