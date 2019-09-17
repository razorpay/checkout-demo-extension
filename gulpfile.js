'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const dot = require('./scripts/dot/index');
const stylus = require('gulp-stylus');
const autoprefixer = require('autoprefixer-stylus');
const glob = require('glob').sync;
const uglify = require('uglify-js').minify;
const usemin = require('gulp-usemin');
const through = require('through2').obj;
const runSequence = require('run-sequence');
const { execSync } = require('child_process');

const distDir = 'app/dist/v1/';
const cssDistDir = distDir + 'css';

function assetPath(path) {
  return `app/${path}`;
}

let paths = {
  js: assetPath('js/**/*.js'),
  templates: assetPath('_templates/**/*.jst'),
  css: assetPath('css/**/*.styl'),
  images: assetPath('images/**/*'),
  fonts: assetPath('fonts/**/*'),
};

gulp.task('compileTemplates', function(cb) {
  execSync('mkdir -p app/templates');
  dot.process({
    path: 'app/_templates',
    destination: assetPath('templates'),
    global: 'templates',
  });
  cb();
});

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

function joinJs() {
  return gulp
    .src(assetPath('*.html'))
    .pipe(usemin())
    .pipe(
      through(function(file, enc, cb) {
        file.contents = Buffer.from(`(function(){${String(file.contents)}})()`);
        this.push(file);
        cb();
      })
    )
    .pipe(gulp.dest(distDir));
}

gulp.task('usemin', joinJs);

gulp.task('uglify', done => {
  const strictPrefix = '!function(){"use strict";';

  glob(`${distDir}/**/*.js`).forEach(file => {
    let fileContents = fs.readFileSync(file).toString();
    if (!fileContents.startsWith(strictPrefix)) {
      fileContents = `${strictPrefix}${fileContents}}()`;
    }

    fileContents = uglify(fileContents, {
      compress: {
        pure_funcs: [
          'console.log',
          'console.info',
          'console.warn',
          'console.error',
          'console.time',
          'console.timeEnd',
          'console.table',
          'console.assert',
          'console.trace',
        ],
        global_defs: {
          DEBUG_ENV: process.env.NODE_ENV !== 'production',
        },
      },
    }).code;

    fs.writeFileSync(file, fileContents);

    console.log('uglified ' + file);
  });
  done();
});

gulp.task('copyLegacy', cb => {
  execSync(
    `cd ${distDir}; rm *-new.js; for i in *.js; do cp $i $(basename $i .js)-new.js; done;`
  );
  cb();
});

gulp.task('copyConfig', cb => {
  execSync(`cp ${assetPath('config.js')} ${distDir}`);
  cb();
});

gulp.task('compileHTML', gulp.series('usemin', 'uglify', 'copyLegacy'));

gulp.task('staticAssets', function() {
  return gulp
    .src([paths.images, paths.fonts], { base: 'app' })
    .pipe(gulp.dest(`${distDir}`));
});

gulp.task(
  'build',
  gulp.series(
    cb => {
      execSync(`rm -rf ${distDir}`);
      cb();
    },
    'css:prod',
    'compileTemplates',
    'compileHTML',
    'staticAssets',
    cb => {
      console.log(String(execSync('ls -l app/dist/v1')));
      cb();
    }
  )
);

gulp.task(
  'watch',
  gulp.series('build', function(cb) {
    gulp.watch(paths.css, gulp.series('css'));
    gulp.watch(paths.templates, gulp.series('compileTemplates'));
    gulp.watch(paths.js, gulp.series('usemin'));
    gulp.watch(assetPath('*.html'), gulp.series('usemin'));
  })
);

gulp.task('default', gulp.series('build'));
