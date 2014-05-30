module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['data/**/*.js', 'routes/**/*.js', 'app.js', 'Gruntfile.js', 'package.json'],
      options: {
        // options here to override JSHint defaults
        globals: {
          require: true,
          module: true
        }
      }
    },
    jsbeautifier: {
      all: {
        src: ['data/**/*.js', 'routes/**/*.js', 'app.js', 'Gruntfile.js', 'package.json'],
      },
      options: {
        js: {
          jslintHappy: true,
          indentSize: 2
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');

  grunt.registerTask('default', ['jshint', 'jsbeautifier']);

};
