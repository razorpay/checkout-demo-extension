const fs = require('fs')
const glob = require('glob')
const gulp = require('gulp')
const dot = require('dot')
const sass = require('gulp-sass')
const minifyCSS = require('gulp-minify-css')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const usemin = require('gulp-usemin')
const wrap = require('gulp-insert').wrap
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const replace = require('gulp-replace')

require('coffee-script/register')
const mocha = require('gulp-mocha')

const execSync = require('child_process').execSync
const karmaServer = require('karma').Server
const istanbul = require('istanbul')
const jshint = require('gulp-jshint')
const stylish = require('jshint-stylish')

const awspublish = require('gulp-awspublish')

function assetPath(path){
  return 'app/' + path;
}

var distDir = 'app/dist/v1';

gulp.task('watch', ['usemin'], function() {
  gulp.watch(assetPath('_css/*.sass'), ['compileStyles'])
  gulp.watch(assetPath('_templates/*.jst'), ['compileTemplates', 'makemin'])
  gulp.watch([assetPath('js/**'), assetPath('*.html')], ['makemin'])
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
  return gulp.src(assetPath('_css/*.sass'))
    .pipe(sass())
    .pipe(minifyCSS())
    .pipe(concat('checkout-new.css'))
    .pipe(autoprefixer({
      browsers: ['ie 8', 'android 2.2', 'last 10 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(distDir + '/css'));
});

gulp.task('buildDev', ['compileTemplates', 'compileStyles']);

function makemin(){
  return gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest(distDir));
}

gulp.task('makemin', makemin);

gulp.task('usemin', ['buildDev'], makemin);

// create production build and sourcemaps
gulp.task('default', ['usemin'], buildProd);

function buildProd(){
  return gulp.src(distDir + '/*.js')
    .pipe(wrap('(function(){"use strict";', '})()'))
    // .pipe(sourcemaps.init())
    .pipe(uglify())
    // .pipe(sourcemaps.write('./'))
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
    console.log(e.message);
    return [];
  }
}

var karmaLibs = [
  'spec/jquery-1.11.1.js',
  'spec/sendkeys.js',
  'spec/sinon-1.17.3.js',
  'spec/expect.js',
  'spec/helpers.js'
];

var karmaOptions = {
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

var reporter = 'dots';
if(!process.env.WERCKER){
  reporter = 'nyan';
}
karmaOptions.reporters.push(reporter);

var allOptions;

gulp.task('makeKarmaOptions', ['usemin'], function(){
  allOptions = glob.sync(assetPath('*.html')).map(function(html){
    var o = JSON.parse(JSON.stringify(karmaOptions));
    o.files = karmaLibs.concat(getJSPaths(html, '<script src='));

    // adding paths to cover
    getJSPaths(html, '<!--coverage-->').forEach(function(path){
      o.preprocessors[path] = ['coverage'];
    })
    o.coverageReporter.dir = 'coverage' + html.replace((/^[^\/]+|\.[^\.]+$/g),'');

    return o;
  });
})

// unit tests + coverage
gulp.task('test:unit', ['makeKarmaOptions'], function(done){
  testFromStack(0, allOptions, done);
})

function testFromStack(counter, allOptions, done){
  new karmaServer(allOptions[counter], function(exitCode) {
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
  var collector = new istanbul.Collector();
  var reporter = new istanbul.Reporter(false, 'coverage/final');

  glob.sync('coverage/**/coverage-final.json').forEach(function(jsonFile){
    collector.add(JSON.parse(fs.readFileSync(jsonFile, 'utf8')));
  })

  reporter.add('html');
  reporter.write(collector, true, function(){});
  console.log('Report created in coverage/final');
}

// blackbox tests
gulp.task('test', ['test:unit'], function(){
  var jsHint = gulp.src([assetPath('dist/v1/*.js'), '!' + assetPath('dist/v1/*-new.js')])
    .pipe(wrap('(function(){"use strict";', '})()'))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))

  jsHint.on('finish', function(){
    buildProd().on('finish', function(){
      gulp.src('test/release/checkout.coffee')
        .pipe(mocha({
          reporter: 'nyan',
          timeout: 20000
        })).once('error', function(){
          setTimeout(function(){
            process.exit(1);
          }, 1000)
        })
        .once('end', function(){
          setTimeout(function(){
            process.exit();
          }, 1000)
        });
      })
  })
})

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