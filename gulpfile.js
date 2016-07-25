'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const dot = require('./scripts/dot/index');
const glob = require('glob')
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const stylelint = require('gulp-stylelint');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const wrap = require('gulp-insert').wrap;
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const usemin = require('gulp-usemin');
const del = require('del');
const runSequence = require('run-sequence');
const gulpif = require('gulp-if');
const minimist = require('minimist');
const execSync = require('child_process').execSync;
const KarmaServer = require('karma').Server;
const istanbul = require('istanbul');
const awspublish = require('gulp-awspublish');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const webdriver = require('gulp-webdriver');
const vfs = require('vinyl-fs');
const testServer = require('./test/e2e/server/index.js');
const internalIp = require('internal-ip');

const distDir = 'app/dist/v1/';

function assetPath(path) {
  return `app/${path}`;
}

let knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};

let options = minimist(process.argv.slice(2), knownOptions);
let isProduction = options.env === 'production';

let paths = {
  js: assetPath('js/**/*.js'),
  templates: assetPath('_templates/**/*.jst'),
  css: assetPath('css/**/*.scss'),
  images: assetPath('images/**/*'),
  fonts: assetPath('fonts/**/*')
};

gulp.task('clean', function () {
  return del(distDir, {force: true});
});

gulp.task('compileTemplates', function() {
  execSync('mkdir -p app/templates');
  dot.process({
    path: 'app/_templates',
    destination: assetPath('templates'),
    global: 'templates'
  });

  return gulp.src(assetPath('templates/*.js'))
    .pipe(replace('\n/**/', ''))
    .pipe(wrap('/* jshint ignore:start */\n\n', '\n\n/* jshint ignore:end */'))
    .pipe(gulp.dest(assetPath('templates')));
});

let styleLintOptions = {
  syntax: 'scss',
  reporters: [
    {
      formatter: 'string',
      console: true
    }
  ]
};

gulp.task('compileStyles', function() {
  return gulp.src(paths.css)
    .pipe(stylelint(styleLintOptions))
    .pipe(sass())
    .pipe(concat('checkout.css'))
    .pipe(gulpif(isProduction, cleanCSS({compatibility: 'ie8'})))
    .pipe(autoprefixer({
      browsers: ['ie 8', 'android 2.2', 'last 10 versions', 'iOS 7'],
      cascade: false
    }))
    .pipe(gulp.dest(`${distDir}/css`));
});

gulp.task('usemin', function() {
  return gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest(distDir));
});

gulp.task('uglify', function() {
  return gulp.src([`${distDir}/**/*.js`])
    // .pipe(sourcemaps.init())
    .pipe(gulpif(isProduction, uglify()))
    // .pipe(sourcemaps.write('./', {
      // debug: true
    // }))
    .pipe(gulp.dest(distDir));
});

gulp.task('copyLegacy', function(){
  gulp.src(`${distDir}/checkout.js`)
    .pipe(rename('checkout-new.js'))
    .pipe(gulp.dest(distDir));

  gulp.src(`${distDir}/checkout-frame.js`)
    .pipe(rename('checkout-frame-new.js'))
    .pipe(gulp.dest(distDir));

  gulp.src(`${distDir}/css/checkout.css`)
    .pipe(rename('css/checkout-new.css'))
    .pipe(gulp.dest(distDir));
})

gulp.task('copyConfig', function() {
  return gulp.src(assetPath('config.js'))
    .pipe(gulp.dest(distDir));
});

gulp.task('compileHTML', function() {
  if (isProduction) {
    runSequence('usemin', 'hint', 'uglify', 'copyLegacy');
  } else {
    runSequence('usemin');
  }
});

gulp.task('staticAssets', function() {
  return gulp.src([paths.images, paths.fonts], { base: 'app' })
    .pipe(gulp.dest(`${distDir}`));
});

gulp.task('build', function() {
  runSequence('clean', ['compileStyles', 'compileTemplates'], 'compileHTML', 'staticAssets');
});

gulp.task('setServeENV', function() {
  isProduction = false;
  styleLintOptions.failAfterError = false;
});

gulp.task('setTestENV', function() {
  isProduction = false;
  styleLintOptions.failAfterError = true;
});

gulp.task('serve', ['setServeENV', 'build'], function() {
  gulp.watch(paths.css, ['compileStyles']);
  gulp.watch([paths.templates], ['compileTemplates']);
  gulp.watch([assetPath('**/*.js'), assetPath('*.html'), '!app/dist/**/*'], ['compileHTML']);
});

gulp.task('watch', ['serve']);

gulp.task('default', ['build']);

/** Font Upload to static **/

gulp.task('uploadStaticAssetsToCDN', function(){
  let target = process.argv.slice(3)[0].replace(/.+=/,'').toLowerCase().trim();
  if(target === 'production') target = 'live';

  let publisher = awspublish.create({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'us-east-1',
    params: {
      Bucket: 'checkout-' + target
    }
  });

  // define custom headers
  let headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src([`${distDir}/fonts/*`, `${distDir}/images/*`])
     // gzip, Set Content-Encoding headers and add .gz extension
    .pipe(awspublish.gzip({ ext: '' }))

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

     // print upload updates to console
    .pipe(awspublish.reporter());
});


/**  Tests  **/

function getJSPaths(html, pattern){
  try{
    return execSync(
        'cat ' + html + ' | grep -F "' + pattern + '" | cut -d\'"\' -f2',
        {encoding: 'utf-8'}
      )
      .split('\n')
      .filter(function(path){return !!path})
      .map(function(path){
        return assetPath(path);
      });
  } catch(e){
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
  browsers: ['PhantomJS'],
  singleRun: true,
  coverageReporter: {
    type : 'json'
  },
  preprocessors: {
    '**/*.coffee': ['coffee']
  },
  nyanReporter: {
    suppressErrorHighlighting: true
  }
};

let reporter = 'dots';
if(!process.env.WERCKER){
  reporter = 'nyan';
}
karmaOptions.reporters.push(reporter);

let karmaLibs = [
  'spec/jquery-1.11.1.js',
  'spec/sendkeys.js',
  'spec/sinon.js',
  'spec/expect.js',
  'spec/helpers.js'
];

gulp.task('makeKarmaOptions', ['build'], function() {
  allOptions = glob.sync(assetPath('*.html')).map(function(html){
    let o = JSON.parse(JSON.stringify(karmaOptions));
    o.files = karmaLibs.concat(getJSPaths(html, '<script src='));

    // adding paths to cover
    getJSPaths(html, '<!--coverage-->').forEach(function(path){
      o.preprocessors[path] = ['coverage'];
    })
    o.coverageReporter.dir = 'coverage' + html.replace((/^[^\/]+|\.[^\.]+$/g),'');

    return o;
  });
});

// unit tests + coverage
gulp.task('test:unit', ['makeKarmaOptions'], function(done){
  setTimeout(function() {
    testFromStack(0, allOptions, done);
  }, 1000);
});

function testFromStack(counter, allOptions, done){
  new KarmaServer(allOptions[counter], function(exitCode) {
    if(exitCode !== 0){
      process.exit(1);
    }
    if(allOptions[++counter]){
      testFromStack(counter, allOptions, done);
    } else {
      allOptions = null;
      createCoverageReport();
      done();
    }
  }).start();
}

function createCoverageReport(){
  let collector = new istanbul.Collector();
  let reporter = new istanbul.Reporter(false, 'coverage/final');

  glob.sync('coverage/**/coverage-final.json').forEach(function(jsonFile){
    collector.add(JSON.parse(fs.readFileSync(jsonFile, 'utf8')));
  })

  reporter.add('html');
  reporter.write(collector, true, function(){});
  console.log('Report created in coverage/final');
}

/***** E2E/Acceptance tests *****/


gulp.task('e2e:run', function(done){
  return gulp.src('./wdio.conf.js')
    .pipe(webdriver({
      baseUrl: `http://${internalIp.v4()}:3000`
    }))
    .on('error', function(){
      done();
    });
})

gulp.task('symlinkDist', () => {
  return vfs.src(distDir, { followSymlinks: false })
    .pipe(vfs.symlink('test/e2e/server/dist/v1'));
});

gulp.task('symlinkJquery', () => {
  return vfs.src('node_modules/jquery/dist/jquery.js', { followSymlinks: false })
    .pipe(vfs.symlink('test/e2e/server/lib/'));
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

gulp.task('test:e2e', () => {
  runSequence(['symlinkDist', 'symlinkJquery'], 'testserver:start', 'e2e:run', 'testserver:stop');
});

/***** --- *****/

gulp.task('hint', function(){
  return gulp.src([assetPath('dist/v1/*.js')])
    .pipe(wrap('(function(){"use strict";', '})()'))
    .pipe(gulp.dest(distDir))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
})

gulp.task('test', function() {
  runSequence('setTestENV', 'test:unit', 'test:e2e');
});



/* Util functions */

// Merge the contents of two objects together into the first object.
function merge(original, updates) {
  if (!updates || typeof updates !== 'object') {
    return original;
  }

  var props = Object.keys(updates);
  var prop;

  for (var i = 0; i < props.length; i++) {
    prop = props[i];
    original[prop] = updates[prop];
  }

  return original;
}
