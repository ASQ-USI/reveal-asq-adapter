/**
  @fileoverview main Grunt task file
**/
'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
     urequire: {
          umd: { // using the old DEPRECATED v0.1.x format
            template: 'combined',
            filez: ['**/*'],
            path: 'browser',
            dependencies: {
              imports: {'bows':'bows'},
              // rootExports: {
              //   root: {
              //     'index': 'impressAsqForkAsqAdapter'
              //   }
              // }
            },
            main: 'index',
            dstPath: 'dist/revealasqadapter.js'
          },
          umd_min: { 
            derive: 'umd',            
            dependencies: {
              imports: {'bows':'bows'},
            },
            optimize: 'uglify2',
            dstPath: 'dist/revealasqadapter.min.js'
          },
          _defaults: {
            allNodeRequires: true,
            verbose: true
          }
        }
  });

  // Default task(s).
  grunt.registerTask('dist', ['urequire:umd', 'urequire:umd_min']);

  //npm tasks
  require('load-grunt-tasks')(grunt);
};
