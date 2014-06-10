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
		}
	});
    grunt.registerTask('default', ['htmlConvert','useminPrepare','concat','uglify','cssmin']);
    grunt.registerTask('template',['htmlConvert']);
};