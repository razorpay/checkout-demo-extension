'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const dot = require('./scripts/dot/index');
const glob = require('glob')
const plumber = require('gulp-plumber')
const stylus = require('gulp-stylus');
const cleanCSS = require('gulp-clean-css');
const stylint = require('gulp-stylint');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const usemin = require('gulp-usemin');
const through = require('through');
const runSequence = require('run-sequence');
const execSync = require('child_process').execSync;
const KarmaServer = require('karma').Server;
const istanbul = require('istanbul');
const awspublish = require('gulp-awspublish');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const webdriver = require('gulp-webdriver');
const testServer = require('./test/e2e/server/index.js');
const internalIp = require('internal-ip');
const lazypipe = require('lazypipe');

const distDir = 'app/dist/v1/';

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

gulp.task('clean', ()=> execSync(`rm -rf ${distDir}`))

gulp.task('compileTemplates', function() {
  execSync('mkdir -p app/templates');
  dot.process({
    path: 'app/_templates',
    destination: assetPath('templates'),
    global: 'templates'
  });
});

var concatCss = lazypipe()
  .pipe(stylint)
  .pipe(stylint.reporter)
  .pipe(stylus)
  .pipe(autoprefixer, {
    browsers: ['ie 8', 'android 2.2', 'last 10 versions', 'iOS 7'],
    cascade: false
  })
  .pipe(concat, 'checkout.css')

gulp.task('concatCss', function() {
  return gulp.src(paths.css)
    .pipe(plumber())
    .pipe(concatCss())
    .pipe(gulp.dest(`${distDir}/css`));
});

gulp.task('cleanCSS', function() {
  return gulp.src(paths.css)
    .pipe(concatCss())
    .pipe(stylint.reporter('fail', { failOnWarning: true }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(`${distDir}/css`));
})

gulp.task('usemin', ()=> {
  return gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest(distDir))
})

gulp.task('uglify', ()=> {
  return gulp.src([`${distDir}/**/*.js`])

    // wrap between iife and user strict
    .pipe(through(function(file){
      file.contents = new Buffer(`(function(){"use strict";${String(file.contents)}})()`)
      this.emit('data', file)
    }))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    // .pipe(sourcemaps.init())
    .pipe(uglify())
    // .pipe(sourcemaps.write('./', {
      // debug: true
    // }))
    .pipe(gulp.dest(distDir))
})

gulp.task('copyLegacy', function(){
  execSync(`cd ${distDir}; rm *-new.js; for i in *.js; do cp $i $(basename $i .js)-new.js; done;`);
})

gulp.task('copyConfig', ()=> execSync(`cp ${assetPath('config.js')} ${distDir}`))

gulp.task('compileHTML', function() {
  runSequence('usemin', 'uglify', 'copyLegacy');
})

gulp.task('staticAssets', function() {
  return gulp.src([paths.images, paths.fonts], { base: 'app' })
    .pipe(gulp.dest(`${distDir}`));
})

gulp.task('build', function(cb) {
  runSequence('clean', ['cleanCSS', 'compileTemplates'], 'compileHTML', 'staticAssets', cb);
})

gulp.task('serve', ['build'], function() {
  gulp.watch(paths.css, ['concatCss'])
  gulp.watch(paths.templates, ['compileTemplates'])
  gulp.watch(paths.js, [/*'hint',*/ 'usemin'])
  gulp.watch(assetPath('*.html'), ['usemin'])
})

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
  browsers: ['Chrome'],
  singleRun: true,
  coverageReporter: {
    type : 'json'
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
  var target = 'test/e2e/server/public/dist/'
  var dist = Array(target.split('/').length).join('../') + distDir
  execSync(`rm -rf ${target}; mkdir ${target}; ln -s ${dist} ${target}/v1`)
})

let testServerInstance;

gulp.task('testserver:start', () => {
  testServerInstance = testServer.listen(3000, function(error) {
    if (error) {
      console.error(`exec error: ${error}`);
      process.exit(1);
    }
  })
})

gulp.task('testserver:stop', () => {
  testServerInstance.close();
})

gulp.task('test:e2e', (cb) => {
  runSequence('build', 'symlinkDist', 'testserver:start', 'e2e:run', 'testserver:stop', cb);
})

gulp.task('test', ()=> runSequence('test:unit', 'test:e2e'))
