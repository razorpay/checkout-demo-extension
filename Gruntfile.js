'use strict';
module.exports = function(grunt){

    //
    // Load all grunt tasks
    //
    require('load-grunt-tasks')(grunt);

    grunt.file.defaultEncoding = 'utf8';

    grunt.initConfig({
        htmlConvert: {
            templates: {
                src: ['src/templates/*.tmpl'],
                dest: '.tmp/templates.js'
            }
        },

        useminPrepare: {
            html: 'layout.html',
            options: {
              dest: 'dist' // dist is the only directory served
            }
        },

        copy: {
            main: {
                cwd: 'src/images/',
                src: ['**'],
                dest: 'dist/v1/images/',
                expand: true
            },
            debug: {
                cwd: '.',
                nonull: true,
                src: '.tmp/concat/v1/checkout.js',
                dest: 'dist/v1/checkout.js',
            }
        },

        watch: {
            files: '**',
            tasks: 'default',
            options: {
                spawn: true,
                cwd: 'src/',
                interrupt: true
            }
        }
    });

    grunt.registerTask('default', ['htmlConvert','useminPrepare','concat','uglify','cssmin','copy:main']);

    grunt.registerTask('debug', ['htmlConvert', 'useminPrepare', 'concat', 'copy:debug', 'cssmin', 'copy:main']);

    grunt.registerTask('template', ['htmlConvert']);
};