// Include gulp
var fs = require('fs');
var gulp = require('gulp');
var dot = require('dot');
var less = require('gulp-less');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');

function assetPath(path){
  return 'app/' + path;
}

gulp.task('watch', ['buildDev'], function() {
  gulp.watch(assetPath('templates/*.jst'), ['compileTemplates']);
  gulp.watch(assetPath('css/*.less'), ['compileStyles']);
});

gulp.task('compileTemplates', function(){
  dot.process({
    path: assetPath('templates'),
    destination: assetPath('_templates'),
    global: 'Razorpay.templates'
  });
});

gulp.task('compileStyles', function(){
  gulp.src(assetPath('css/*.less'))
    .pipe(less())
    .pipe(concat('checkout.css'))
    .pipe(autoprefixer({browsers: ['last 10 versions']}))
    .pipe(gulp.dest(assetPath('_css')));
});

gulp.task('dirStructure', function(){
  ['_css', '_templates'].forEach(function(path){
    if(!fs.existsSync(assetPath(path))){
      fs.mkdirSync(assetPath(path));
    }
  })
})

gulp.task('buildDev', ['dirStructure', 'compileTemplates', 'compileStyles']);

gulp.task('usemin', function(){
  gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest('app/_test'));
})

gulp.task('build', ['buildDev', 'usemin'], function(){
  gulp.src('app/_test/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('app/_build'));
  gulp.src('app/_css/*.css')
    .pipe(gulp.dest('app/_build'));
})