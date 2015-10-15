var fs = require('fs');
var glob = require('glob');
var gulp = require('gulp');
var dot = require('dot');
var less = require('gulp-less');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var execSync = require('child_process').execSync;
var karmaServer = require('karma').Server;
var istanbul = require('istanbul');

var awspublish = require('gulp-awspublish');

function assetPath(path){
  return 'app/' + path;
}

var distDir = 'app/dist/v1';

gulp.task('watch', ['buildDev', 'usemin'], function() {
  gulp.watch(assetPath('_css/*.less'), ['compileStyles']);
  gulp.watch([assetPath('js/**'), assetPath('*.html'), assetPath('_templates/*.jst')], ['usemin']);
});

// compiles .jst to .js, which is template contained in a function
gulp.task('compileTemplates', function(){
  return dot.process({
    path: assetPath('_templates'),
    destination: assetPath('templates'),
    global: 'Razorpay.templates'
  });
});

gulp.task('compileStyles', function(){
  return gulp.src(assetPath('_css/*.less'))
    .pipe(less())
    .pipe(concat('checkout.css'))
    .pipe(autoprefixer({browsers: ['last 10 versions']}))
    .pipe(gulp.dest(assetPath('css')));
});

gulp.task('buildDev', ['compileTemplates', 'compileStyles']);

gulp.task('usemin', ['compileTemplates'], function(){
  return gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest(distDir));
})

gulp.task('sourceMaps', ['compileTemplates', 'usemin'], function(){
  return gulp.src(distDir + '/checkout-frame.js')
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(distDir));
})

gulp.task('default', ['buildDev', 'usemin', 'sourceMaps'], function(){
  // uglify
  gulp.src(distDir + '/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(distDir));
})

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

gulp.task('test', ['buildDev'], function(done){
  // leak discreet variables
  execSync('cd app && sed -i -- s@//ENV_TEST@/*ENV_TEST*/@g $(find js -type f)');

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
    if(allOptions[++counter]){
      testFromStack(counter, allOptions, done);
    } else if(allOptions.release){
      done();
    } else {
      execSync('sed -i -- s@/\\\\*ENV_TEST\\\\*/@//ENV_TEST@g $(find app/js -type f)');
      createCoverageReport();
      // testRelease(done);
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
  var stream = gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest(assetPath('_test')));
  
  stream.on('finish', function(){
    allOptions = glob.sync(assetPath('_test/*.js')).map(function(released){
      var o = JSON.parse(JSON.stringify(karmaOptions));
      o.files = karmaLibs.concat([released, released.replace('app/_test', 'test/release')]);
      return o;
    });
    allOptions.release = true;

    testFromStack(0, allOptions, done);
  })
}

gulp.task('fontUpload', function(){
  var publisher = awspublish.create({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'us-east-1',
    params: {
      Bucket: 'checkout-beta'
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