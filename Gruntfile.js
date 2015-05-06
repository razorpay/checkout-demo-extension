'use strict';
module.exports = function(grunt){
  //Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.file.defaultEncoding = 'utf8';
  grunt.initConfig({
    env: {
      dev: {
        NODE_ENV: 'development',
      },
      test: {
        NODE_ENV: 'test',
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    exec: {
      clean_srv: {
        cmd: 'rm -rf app/srv'
      },
      clean_dist: {
        cmd: 'rm -rf app/dist'
      },
      harp_compile:{
        cmd: 'harp compile app/assets app/srv'
      },
      dir_images: {
        cmd: 'mkdir app/dist && mkdir app/dist/v1'
      },
      copy_images:{
        cmd: 'cp -r app/srv/images app/dist/v1/images/'
      },
      copy_html:{
        cmd: 'cp app/srv/checkout.html app/dist/v1/'
      }
    },
    useminPrepare:{
      html:['app/srv/layout.html', 'app/srv/checkout.html'],
      options: {
        dest: 'app/dist/v1' //dist is the only directory served
      }
    },
    usemin:{
      html:'app/dist/v1/checkout.html',
      options: {
        dest: 'app/dist/v1' //dist is the only directory served
      }
    },
    preprocess: {
      tmpfolder: {
        src : ['.tmp/concat/checkout.js', '.tmp/concat/razorpay.js'],
        options: {
          inline : true,
        }
      }
    },
    karma: {
      custom: {
        configFile: 'spec/custom.conf.js'
      },
      manual: {
        configFile: 'spec/manual.conf.js'
      }
    },

    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true,
        force: true,
      },
      all: [
        'app/assets/js/*.js',
      ]
    },

  });

  /**
   * Internal usage
   * Prepares folders for build
   */
  grunt.registerTask('exec:build', [
    'exec:clean_srv',
    'exec:clean_dist',
    'exec:harp_compile',
    'exec:dir_images',
    'exec:copy_images',
    'exec:copy_html'
  ]);

  grunt.registerTask('build',[
    'env:prod',
    'exec:build',
    'useminPrepare',
    'concat:generated',
    'preprocess',
    'uglify:generated',
    'cssmin:generated',
    'usemin'
  ]);

  /**
   * Alias for build
   */
  grunt.registerTask('default', [
    'build'
  ]);

  /**
   * For internal use
   * Prepares checkout.js for testing
   * Checkout.js is placed in test/files/checkout.js
   */
  grunt.registerTask('test:prepare', [
    'env:test',
    'exec:clean_srv',
    'exec:harp_compile',
    'useminPrepare',
    'concat:generated',
    'preprocess'
  ]);

  grunt.registerTask('test', [
    'test:prepare',
    'karma:custom',
    'karma:manual'
  ]);
};
