'use strict';
module.exports = function(grunt){
	//Load all grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.file.defaultEncoding = 'utf8';
	grunt.initConfig({
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
				cmd: 'mkdir app/dist'
			},
			copy_images:{
				cmd: 'cp -r app/srv/images app/dist/images/'
			}
		},
		useminPrepare:{
			html:'app/srv/layout.html',
			options: {
				dest: 'app/dist' //dist is the only directory served
			}
		}
	});
	// grunt.registerTask('start', ['clean', 'sync', 'less', 'htmlConvert'])
	grunt.registerTask('default', ['exec','useminPrepare','concat','uglify','cssmin'])
};