var fs = require('fs')
var glob = require('glob')
var gulp = require('gulp')
var dot = require('dot')
var less = require('gulp-less')
var concat = require('gulp-concat')
var autoprefixer = require('gulp-autoprefixer')
var usemin = require('gulp-usemin')
var wrap = require('gulp-insert').wrap
var uglify = require('gulp-uglify')
var sourcemaps = require('gulp-sourcemaps')
var replace = require('gulp-replace')

var execSync = require('child_process').execSync
var karmaServer = require('karma').Server
var istanbul = require('istanbul')
var jshint = require('gulp-jshint')
var stylish = require('jshint-stylish')

var awspublish = require('gulp-awspublish')

function assetPath(path){
  return 'app/' + path;
}

var distDir = 'app/dist/v1';

gulp.task('watch', ['buildDev', 'usemin'], function() {
  gulp.watch(assetPath('_css/*.less'), ['compileStyles'])
  gulp.watch(assetPath('_templates/*.jst'), ['compileTemplates'])
});

// compiles .jst to .js, which is template contained in a function
gulp.task('compileTemplates', function(){
  execSync('mkdir -p app/templates');
  dot.process({
    path: assetPath('_templates'),
    destination: assetPath('templates'),
    global: 'templates'
  });
  return gulp.src(assetPath('templates/*.js'))
    .pipe(replace('\n/**/',''))
    .pipe(wrap('/* jshint ignore:start */\n\n', '\n\n/* jshint ignore:end */'))
    .pipe(gulp.dest(assetPath('templates')))
});

gulp.task('compileStyles', function(){
  return gulp.src(assetPath('_css/*.less'))
    .pipe(less())
    .pipe(concat('checkout.css'))
    .pipe(autoprefixer({browsers: ['last 10 versions']}))
    .pipe(gulp.dest(distDir + '/css'));
});

gulp.task('buildDev', ['compileTemplates', 'compileStyles']);

gulp.task('usemin', ['buildDev'], function(){
  return gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest(distDir));
})

// create production build and sourcemaps
gulp.task('default', ['usemin'], buildProd);

function buildProd(){
  return gulp.src(distDir + '/*.js')
    .pipe(wrap('(function(){"use strict";', '})()'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(distDir));
}

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
    return [];
  }
}

var karmaLibs = [
  'spec/jquery-1.11.1.js',
  'spec/jasmine-jquery.js',
  'spec/sendkeys.js',
  'spec/helpers.js'
];

var karmaOptions = {
  frameworks: ['jasmine'],
  reporters: ['progress', 'coverage'],
  port: 9876,
  colors: true,
  logLevel: 'ERROR',
  browsers: ['PhantomJS'],
  singleRun: true,
  coverageReporter: {
    type : 'json'
  }
};

gulp.task('test', ['buildDev', 'usemin'], function(done){
  // console.log(fs.readFileSync(distDir + '/razorpay.js', 'utf-8'))
  allOptions = glob.sync(assetPath('*.html')).map(function(html){
    var o = JSON.parse(JSON.stringify(karmaOptions));
    o.files = karmaLibs.concat(getJSPaths(html, '<script src='));
    o.preprocessors = {};
    getJSPaths(html, '<!--coverage-->').forEach(function(path){
      o.preprocessors[path] = ['coverage'];
    })
    o.coverageReporter.dir = 'coverage' + html.replace((/^[^\/]+|\.[^\.]+$/g),'');
    return o;
  });
  testFromStack(0, allOptions, done);
})

function testFromStack(counter, allOptions, done){
  new karmaServer(allOptions[counter], function(exitCode) {
    if(exitCode !== 0){
      process.exit(1);
    }
    if(allOptions[++counter]){
      testFromStack(counter, allOptions, done);
    } else if(allOptions.release){
      done();
    } else {
      createCoverageReport();
      testRelease(done);
    }
  }).start();
}

function createCoverageReport(){
  var collector = new istanbul.Collector();
  var reporter = new istanbul.Reporter(false, 'coverage/final');

  glob.sync('coverage/**/coverage-final.json').forEach(function(jsonFile){
    collector.add(JSON.parse(fs.readFileSync(jsonFile, 'utf8')));
  })

  reporter.add('html');
  reporter.write(collector, true, function(){});
  console.log('Report created in coverage/final');
}

function testRelease(done){
  var jsGlob = assetPath('dist/v1/*.js');
  var jsHint = gulp.src(jsGlob)
    .pipe(wrap('(function(){"use strict";', '})()'))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))

  jsHint.on('finish', function(){
    var stream = buildProd();
    stream.on('finish', function(){
      allOptions = glob.sync(jsGlob).map(function(released){
        var o = JSON.parse(JSON.stringify(karmaOptions));
        o.files = karmaLibs.concat([released, released.replace('app/dist/v1', 'test/release')]);
        return o;
      });
      allOptions.release = true;
      testFromStack(0, allOptions, done);  
    })
  })
}

gulp.task('fontUpload', function(){
  var target = process.argv.slice(3)[0].replace(/.+=/,'').toLowerCase().trim();
  if(target == 'production') target = 'live';

  var publisher = awspublish.create({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'us-east-1',
    params: {
      Bucket: 'checkout-' + target
    }
  });

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src(distDir + '/fonts/*')
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