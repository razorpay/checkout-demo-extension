// Include gulp
var gulp = require('gulp');
var dot = require('dot');

function assetPath(path){
  return 'app/assets/' + path;
}

gulp.task('watch', function() {
  gulp.watch(assetPath('templates/*.dot'), ['compileTemplates']);
  gulp.watch(assetPath('css/*.styl'), ['compileStyles']);
});

gulp.task('compileTemplates', function(){
  dot.process({
    path: assetPath('templates'),
    destination: assetPath('_templates'),
    global: 'Razorpay.templates'
  });
});

gulp.task('compileStyles', function(){
  
});