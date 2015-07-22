'use strict';
module.exports = function(grunt){
  //Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.file.defaultEncoding =  'utf8';
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
      make_dir: {
        cmd: 'mkdir -p app/dist/v1/css'
      },
      copy_images:{
        cmd: 'cp -r app/srv/images app/dist/v1/images/'
      },
      copy_css:{
        cmd: 'cp app/srv/css/checkout.css app/dist/v1/css/checkout.css'
      },
      copy_html:{
        cmd: 'cp app/srv/*.html app/dist/v1/'
      }
    },
    inline: {
      dist: {
        options:{
            tag: '',
            uglify: true
        },
        src: 'app/srv/razorpay.html',
        dest: 'app/srv/razorpay.html'
      }
    },
    useminPrepare:{
      html:['app/srv/*.html'],
      options: {
        dest: 'app/dist/v1'
      }
    },
    usemin:{
      html:'app/dist/v1/*.html',
      options: {
        dest: 'app/dist/v1'
      }
    },
    uglify: {
      options: {
        mangle: {
          toplevel: true,
          sort: true
        },
        compress: {
          negate_iife: true,
          drop_console: true,
          drop_debugger: true,
          unsafe: true
        },
        mangleProperties: true,
        preserveComments: false,
        sourceMap: true,
        sourceMapIncludeSources: true
      }
    },
    aws: loadAwsKeys(),
    aws_s3: {
      options: {
        accessKeyId: '<%= aws.AWSAccessKeyId %>', // Use the variables
        secretAccessKey: '<%= aws.AWSSecretKey %>', // You can also use env variables
        region: 'us-east-1'
      },
      beta: {
        options: {
          bucket: 'checkout-beta',
          differential: true, // Only uploads the files that have changed
          gzipRename: 'ext' // when uploading a gz file, keep the original extension
        },
        files: [{
          expand: true,
          cwd: 'app/assets/fonts', src: ['**'], dest: '/'
        }]
      },
      production: {
        options: {
          bucket: 'checkout-live',
          differential: true, // Only uploads the files that have changed
          gzipRename: 'ext' // when uploading a gz file, keep the original extension
        },
        files: [{
          expand: true,
          cwd: 'app/assets/fonts', src: ['**'], dest: '/'
        }]
      }
    },
    karma: {
      options: {
        frameworks: ['jasmine'],
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: 'ERROR',
        browsers: ['PhantomJS'],
        singleRun: true,
        browserNoActivityTimeout: 30000,
        files: [
          'spec/jquery-1.11.1.js',
          'spec/jasmine-jquery.js',
          'spec/helpers.js',
        ]
      },
      'razorpay': {
        name: 'razorpay.js',
        options: {
          preprocessors: {
            'app/srv/js/razorpay-submit.js': ['coverage'],
            'app/srv/js/razorpay-hedwig.js': ['coverage']
          },
          coverageReporter: {
            type : 'json',
            dir : 'coverage/razorpay/'
          },
          files: [
            'test/razorpay-submit.js'
          ]
        }
      },
      'checkout': {
        name: 'checkout.js',
        options: {
          preprocessors: {
            'app/srv/js/checkout-open.js': ['coverage']
          },
          coverageReporter: {
            type : 'json',
            dir : 'coverage/checkout/'
          },
          files: [
            'test/base.js',
            'test/checkout-open.js'
          ]
        }
      },
      'frame': {
        name: 'checkout-frame.js',
        options: {
          preprocessors: {
            'app/srv/js/in-iframe.js': ['coverage']
          },
          coverageReporter: {
            type : 'json',
            dir : 'coverage/frame/'
          },
          files: [
            'app/assets/js/lib/sendkeys.js',
            'test/in-iframe.js'
          ]
        }
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
    }
  });

  /** Helper method to load AwsKeys from multiple sources */
  function loadAwsKeys() {
    if(grunt.file.exists('aws-keys.json')) {
      return grunt.file.readJSON('aws-keys.json');
    }
    else {
      return({
        "AWSAccessKeyId": process.env.AWS_KEY,
        "AWSSecretKey": process.env.AWS_SECRET
      });
    }
  }

  /**
   * Internal usage
   * Prepares folders for build
   */
  grunt.registerTask('exec:build', [
    'exec:clean_srv',
    'exec:clean_dist',
    'exec:harp_compile',
    'exec:make_dir',
    'exec:copy_images',
    'exec:copy_css',
    'inline',
    'exec:copy_html'
  ]);

  grunt.registerTask('build',[
    'env:prod',
    'exec:build',
    'useminPrepare',
    'uglifyPrepare',
    'uglify:generated',
    'usemin',
    'sourceMaps'
  ]);

  grunt.registerTask('uglifyPrepare', function(){
    var uglify = grunt.config.get('uglify');
    uglify.generated.files = {};

    grunt.config.get('concat').generated.files.forEach(function(config){
      uglify.generated.files['app/dist/v1/' + config.dest.replace(/.+\//g,'')] = config.src;
    })
    grunt.config.set('uglify', uglify);
  })

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
    'prepareKarma'
  ]);

  grunt.registerTask('test', [
    'test:prepare',
    'karma:razorpay',
    'karma:checkout',
    'karma:frame',
    'createReport'
  ]);

  var target = grunt.option('target') && grunt.option('target').toLowerCase() || 'beta';

  grunt.registerTask('fonts:upload', 'Upload Fonts', ['aws_s3:' + target]);

  grunt.registerTask('prepareKarma', 'Prepare Karma', function(a, b) {
    var fileSets = grunt.config.get('uglify');
    fileSets = fileSets.generated.files;

    var blocks = {};
    for(var i in fileSets){
      var item = i.split('/').pop();
      blocks[item] = fileSets[i];

      for(var i in blocks[item]){
        if(/rollbar|fin\.js/.test(blocks[item][i])){
          blocks[item].splice(i,1);
        }
      }
    }

    var karma = grunt.config.get('karma');

    for(var key in karma){
      var block = blocks[karma[key].name];
      if(typeof block === 'undefined') continue;

      block = karma.options.files.concat(block);
      karma[key].options.files = block.concat(karma[key].options.files);
    }

    grunt.config.set('karma', karma);
  });

  grunt.registerTask('sourceMaps', 'Removing source map comments', function(){
    var fileSets = grunt.config.get('uglify');
    fileSets = fileSets.generated.files;

    var htmlclean = {};
    var karma = grunt.config.get('karma');

    for(var i in fileSets){
      var item = i.split('/').pop();

      htmlclean[item] = {
        src: i,
        dest: i
      }
    }

    grunt.config.set('htmlclean', htmlclean);
    grunt.task.run('htmlclean');
  })

  grunt.registerTask('createReport', 'Creates combined istanbul report', function(){
    var istanbul = require('istanbul'),
      fs = require('fs'),
      collector = new istanbul.Collector(),
      reporter = new istanbul.Reporter(false, 'coverage/final'),
      sync = true;

    var folder = fs.readdirSync('coverage/razorpay');
    var env = folder[0];

    var obj1 = JSON.parse(fs.readFileSync('coverage/razorpay/'+env+'/coverage-final.json', 'utf8'));
    var obj2 = JSON.parse(fs.readFileSync('coverage/checkout/'+env+'/coverage-final.json', 'utf8'));
    var obj3 = JSON.parse(fs.readFileSync('coverage/frame/'+env+'/coverage-final.json', 'utf8'));

    collector.add(obj1);
    collector.add(obj2);
    collector.add(obj3);

    reporter.add('html');
    reporter.write(collector, sync, function(){});
    grunt.log.writeln('Report created in coverage/final');
  })
};
