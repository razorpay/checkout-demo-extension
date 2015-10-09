// Include gulp
var fs = require('fs');
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
    .pipe(gulp.dest('app/_build'));
})

gulp.task('sourceMaps', function(){
  return gulp.src('app/_build/checkout-frame.js')
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/_build'));
})

gulp.task('build', ['buildDev', 'usemin', 'sourceMaps'], function(){
  // uglify
  gulp.src('app/_build/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('app/_build'));

  // copy css
  gulp.src('app/_css/*.css')
    .pipe(gulp.dest('app/_build/css'));

  // copy images
  gulp.src('app/images/**')
    .pipe(gulp.dest('app/_build/images'));
})

gulp.task('test', ['buildDev'], function(){
  // inline test files
  child_process.execSync('cd app && rm -rf _test && cp -r js _test && for i in _test/*.js; do j=`basename $i`; sed -i -e "/INLINE_TESTING/r ../test/inline/"$j $i; done;');
  
  // temporarily point html files to test ones
  child_process.execSync('sed -i -- s!"js/!"_test/!g app/*.html && mkdir -p app/_test/src');

  // usemin inline tests
  var testmin = gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest('app/_test/src'));

  testmin.on('finish', function(){
    var files = [
      'spec/jquery-1.11.1.js',
      'spec/jasmine-jquery.js',
      'spec/sendkeys.js',
      'spec/helpers.js'
    ];
    
    var options = {
      frameworks: ['jasmine'],
      port: 9876,
      colors: true,
      logLevel: 'ERROR',
      browsers: ['PhantomJS'],
      singleRun: true
    };

    allOptions = ['checkout.js', 'razorpay.js', 'checkout-frame.js'].map(function(file){
      var o = JSON.parse(JSON.stringify(options));
      o.files = files.concat(['app/_test/src/' + file]);
      return o;
    });
    testFromStack(0, allOptions);
  })
})

function testFromStack(counter, allOptions){
  new karma.Server(allOptions[counter], function(exitCode) {
    if(allOptions[++counter]){
      testFromStack(counter, allOptions);
    } else {
      child_process.execSync('sed -i -- s!"_test/!"js/!g app/*.html && mkdir -p app/_test/src');
    }
  }).start();
}