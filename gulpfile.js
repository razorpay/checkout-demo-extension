'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const dot = require('./scripts/dot/index');
const glob = require('glob');
const plumber = require('gulp-plumber');
const stylus = require('gulp-stylus');
const autoprefixer = require('autoprefixer-stylus');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');
const through = require('through2').obj;
const runSequence = require('run-sequence');
const execSync = require('child_process').execSync;
const KarmaServer = require('karma').Server;
const istanbul = require('istanbul');
// const testServer = require('./test/e2e/server/index.js');

const rollup = require('rollup');
const rollupConfig = require('./rollup.config.js');

const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');

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
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(stylus(stylusOptions))
    .pipe(gulp.dest(cssDistDir));
});

gulp.task('css:prod', () => {
  return gulp
    .src('app/checkout.styl')
    .pipe(stylus(Object.assign({}, stylusOptions, { compress: true })))
    .pipe(gulp.dest(cssDistDir));
});

function joinJs() {
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
}

gulp.task('usemin', joinJs);

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
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail'))
      .pipe(
        uglify({
          compress: {
            pure_funcs: ['console.log']
          }
        })
      )
      .on('error', function(e) {
        console.log(e);
      })
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
    function() {
      console.log(String(execSync('ls -l app/dist/v1')));
      cb();
    }
  );
});

gulp.task('build:test', function(cb) {
  runSequence('clean', ['css:prod', 'compileTemplates'], 'usemin', cb);
});

gulp.task('watch', ['build'], function() {
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.templates, ['compileTemplates']);
  gulp.watch(paths.js, [/*'hint',*/ 'usemin']);
  gulp.watch(assetPath('*.html'), ['usemin']);

  let watcher = rollup.watch(rollupConfig);
  watcher.on('event', e => {
    switch (e.code) {
      case 'BUNDLE_END':
        console.log(`${path.basename(e.input)}: ${e.duration}ms`);
        joinJs();
        break;
      case 'ERROR':
      case 'FATAL':
        console.error('\x1b[31m', e.error.toString(), '\x1b[0m');
    }
  });
});

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
  customLaunchers: {
    ChromeHeadlessNoSandbox: {
      base: 'ChromiumHeadless',
      flags: [
        '--no-sandbox',
        '--user-data-dir=/tmp/chrome-test-profile',
        '--disable-web-security'
      ]
    }
  },
  frameworks: ['mocha'],
  reporters: ['coverage'],
  port: 9876,
  colors: true,
  logLevel: 'ERROR',
  browsers: ['ChromeHeadlessNoSandbox'],
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

gulp.task('makeKarmaOptions', ['build:test'], function() {
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
      done();
    }
  }).start();
}
