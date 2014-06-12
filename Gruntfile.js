'use strict';
module.exports = function(grunt){
    //Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.file.defaultEncoding = 'utf8';
    grunt.initConfig({
        htmlConvert:{
            templates: {
                src: ['src/templates/*.tmpl'],
                dest:'.tmp/templates.js'
            }
        },
        useminPrepare:{
            html:'layout.html',
            options: {
              dest: 'dist'//dist is the only directory served
            }
        },
        copy:{
            main: {
                src: ['**'],
                dest: 'dist/v1/images/',
                cwd: 'src/images/',
                expand: true
            }
        },
        watch:{
            files:'**',
            tasks:'default',
            options:{
                spawn: true,
                cwd:'src/',
                interrupt: true
            }
        }
    });
    grunt.registerTask('default', ['htmlConvert','useminPrepare','concat','uglify','cssmin','copy']);
    grunt.registerTask('template',['htmlConvert']);
};