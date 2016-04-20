'use strict';

const path = require('path');
const gulp = require('gulp');
const dot = require('dot');
const less = require('gulp-less');
const minifyCSS = require('gulp-minify-css');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const wrap = require('gulp-insert').wrap;
const replace = require('gulp-replace');
const usemin = require('gulp-usemin');
const del = require('del');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');

const distDir = 'dist/v1/';

function assetPath(path) {
  return `app/${path}`;
}

let paths = {
  js: assetPath('js/**/*.js'),
  templates: assetPath('_templates/**/*.jst'),
  css: assetPath('css/**/*.less'),
  images: assetPath('images/**/*'),
  fonts: assetPath('fonts/**/*')
};

gulp.task('clean', function () {
  return del(distDir, {dryRun: true});
});

gulp.task('compileTemplates', function() {
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


gulp.task('compileStyles', function(){
  return gulp.src(paths.css)
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(concat('checkout.css'))
    .pipe(autoprefixer({
      browsers: ['ie 8', 'android 2.2', 'last 10 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(`${distDir}/css`));
});

gulp.task('usemin', function() {
  return gulp.src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(gulp.dest(distDir));
});

gulp.task('sourcemaps', function() {
  return gulp.src(`${distDir}/**/*.js`)
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./', {
      debug: true
    }))
    .pipe(gulp.dest(distDir));
});

gulp.task('compileHTML', function() {
  runSequence('usemin', 'sourcemaps');
});

gulp.task('staticAssets', function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest(`${distDir}/images`));
});

gulp.task('build', function() {
  runSequence('clean', ['compileStyles', 'compileTemplates'], 'compileHTML', 'staticAssets');
});

gulp.task('serve', ['build'], function() {
  gulp.watch(paths.css, ['compileStyles']).on('change', browserSync.reload);
  gulp.watch([paths.templates], ['compileTemplates']).on('change', browserSync.reload);
  gulp.watch(assetPath('*.html'), ['compileHTML']).on('change', browserSync.reload);
  // gulp.watch([paths.templates, paths.js, assetPath('*.html')], ['compileScripts']).on('change', browserSync.reload);

  browserSync.init({
    server: './dist/v1'
  });
});
