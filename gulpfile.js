'use strict';

const path = require('path');
const gulp = require('gulp');
const stylus = require('gulp-stylus');
const autoprefixer = require('autoprefixer-stylus');
const { execSync } = require('child_process');

const rollup = require('rollup');
const rollupConfig = require('./rollup.config.js');

const distDir = 'app/dist/v1/';
const cssDistDir = distDir + 'css';

function assetPath(path) {
  return `app/${path}`;
}

let paths = {
  css: assetPath('**/*.styl'),
};

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

const stylusOptions = {
  use: [
    autoprefixer({
      browsers: ['android 4.4', 'last 10 versions', 'iOS 7'],
    }),
  ],
};

gulp.task('css', () => {
  return gulp
    .src('app/checkout.styl')
    .pipe(stylus(stylusOptions))
    .on('error', handleError)
    .pipe(gulp.dest(cssDistDir));
});

gulp.task('css:prod', () => {
  return gulp
    .src('app/checkout.styl')
    .pipe(stylus(Object.assign({}, stylusOptions, { compress: true })))
    .pipe(gulp.dest(cssDistDir));
});

gulp.task(
  'build',
  gulp.series('css:prod', (cb) => {
    console.log(String(execSync('ls -l app/dist/v1')));
    cb();
  })
);

gulp.task('watch', () => {
  gulp.watch(paths.css, gulp.series('css'));
  rollup.watch(rollupConfig).on('event', (event) => {
    switch (event.code) {
      case 'BUNDLE_START':
        return console.log('processing ' + event.input);
      case 'BUNDLE_END':
        return console.log(
          'built ' +
            event.output.map((o) => path.relative(__dirname, o)) +
            ' in ' +
            event.duration +
            'ms'
        );
      case 'ERROR':
        if (event.error) {
          event = event.error;
          if (event.watchFiles) {
            delete event.watchFiles;
          }
        }
        return console.log(event);
    }
  });
});

gulp.task('default', gulp.series('build'));
