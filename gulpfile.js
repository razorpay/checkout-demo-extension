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

var child_process = require('child_process');
var karma = require('karma');

function assetPath(path){
  return 'app/' + path;
}

gulp.task('watch', ['buildDev'], function() {
  gulp.watch(assetPath('templates/*.jst'), ['compileTemplates']);
  gulp.watch(assetPath('css/*.less'), ['compileStyles']);
});

// compiles .jst to .js, which is template contained in a function
gulp.task('compileTemplates', function(){
  return dot.process({
    path: assetPath('templates'),
    destination: assetPath('_templates'),
    global: 'Razorpay.templates'
  });
});

gulp.task('compileStyles', function(){
  return gulp.src(assetPath('css/*.less'))
    .pipe(less())
    .pipe(concat('checkout.css'))
    .pipe(autoprefixer({browsers: ['last 10 versions']}))
    .pipe(gulp.dest(assetPath('_css')));
});

gulp.task('dirStructure', function(){
  return ['_css', '_templates'].forEach(function(path){
    if(!fs.existsSync(assetPath(path))){
      fs.mkdirSync(assetPath(path));
    }
  })
})

gulp.task('buildDev', ['dirStructure', 'compileTemplates', 'compileStyles']);

gulp.task('usemin', function(){
  return gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest('app/dist/v1'));
})

gulp.task('sourceMaps', function(){
  return gulp.src('app/dist/v1/checkout-frame.js')
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/dist/v1'));
})

gulp.task('default', ['buildDev', 'usemin', 'sourceMaps'], function(){
  // uglify
  gulp.src('app/dist/v1/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('app/dist/v1'));

  // copy css
  gulp.src('app/_css/*.css')
    .pipe(gulp.dest('app/dist/v1/css'));

  // copy images
  gulp.src('app/images/**')
    .pipe(gulp.dest('app/dist/v1/images'));
})

gulp.task('test', ['buildDev'], function(){
  child_process.execSync('sed -i -- s@//ENV_TEST@/*ENV_TEST*/@g $(find app/js -type f)');

  var testFilesArray = glob.sync(assetPath('*.html')).map(function(html){
    return fs.readFileSync(html, "utf-8")
      .match(/<script src="[^"]+"><\/script>/g)
      .map(function(tag){
        return assetPath(tag.replace(/(^[^"]+"|"[^"]+$)/g,''));
      });
  })

  var libs = [
    'spec/jquery-1.11.1.js',
    'spec/jasmine-jquery.js',
    'spec/sendkeys.js',
    'spec/helpers.js'
  ];
  
  var options = {
    frameworks: ['jasmine'],
    // reporters: ['coverage'],
    port: 9876,
    colors: true,
    logLevel: 'ERROR',
    browsers: ['PhantomJS'],
    singleRun: true
  };

  allOptions = testFilesArray.map(function(testFiles){
    var o = JSON.parse(JSON.stringify(options));
    o.files = libs.concat(testFiles);
    return o;
  });
  testFromStack(0, allOptions);
})

function testFromStack(counter, allOptions){
  new karma.Server(allOptions[counter], function(exitCode) {
    if(allOptions[++counter]){
      testFromStack(counter, allOptions);
    } else {
      // child_process.execSync('sed -i -- s@/*ENV_TEST*/@//ENV_TEST@g $(find app/js -type f)');
    }
  }).start();
}