module.exports = function(grunt) {

	// The grunt config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		typescript: {
			dist: {
				src: ['src/ts/**/*.ts'],
				dest: 'src/js'
			}
		},
		concat: {
			options: {
				sourceMap: true
			},
			dist: {
				src: [	'src/js/EventDispatcher.js',
						'src/js/Point.js', 
						'src/js/DragDropContainer.js'
					],
				dest: '.tmp/ddcontainer.js'
			}
		},
		uglify: {
			options: {
				compress: true,
				mangle: true,
				sourceMap: true,
				sourceMapIncludeSources: true,
				sourceMapIn: '.tmp/ddcontainer.js.map',
				banner: '/*! v<%= pkg.version %> | Author: Martin Mende <martin.mende@aristech.de> | https://github.com/mmende/EaselJS-Drag-and-Drop */'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: 'build/ddcontainer.min.js'
			}
		},
		watch: {
			options: {
				livereload: true
			},
			scripts: {
				files: ['src/ts/**/*.ts'],
				tasks: ['scripts']
			},
			styles: {
				files: ['src/style/**/*.scss'],
				tasks: ['styles']
			},
			html: {
				files: ['src/jade/**/*.jade'],
				tasks: ['html']
			}
		}
	});

	// Load prespecified grunt tasks
	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Register own tasks
	grunt.registerTask('scripts', ['typescript', 'concat', 'uglify']);
	grunt.registerTask('default', ['scripts']);
};