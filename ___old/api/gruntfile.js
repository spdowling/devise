'use strict';

module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //assets: grunt.file.readJSON('config/assets.json'),
    assemble: {
      options: {
        assets: 'assets',
        plugins: ['permalinks'],
        partials: ['includes/**/*.hbs'],
        layout: ['layouts/default.hbs'],
        data: ['data/*.{json,yml}']
      },
      site: {
        src: ['docs/*.hbs'],
        dest: './'
      }
    },
    watch: {
      js: {
        files: ['gruntfile.js', 'server.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
        //tasks: ['jshint'],
        options: {
          livereload: 12345
        }
      },
      html: {
        files: ['public/views/**', 'app/views/**'],
        options: {
          livereload: 12345
        }
      },
      css: {
        files: ['public/css/**'],
        tasks: ['csslint'],
        options: {
          livereload: 12345
        }
      }
    },
    jshint: {
      all: {
        src: ['gruntfile.js', 'server.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js', '!test/coverage/**/*.js'],
        options: {
          jshintrc: true
        }
      }
    },
    uglify: {
      production: {
        files: '<%= assets.js %>'
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: {
        src: ['public/css/**/*.css']
      }
    },
    cssmin: {
      combine: {
        files: '<%= assets.css %>'
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          args: [],
          ignore: ['public/**'],
          ext: 'js,html',
          //nodeArgs: ['--debug'],
          delayTime: 1,
          env: {
            PORT: 3000
          },
          cwd: __dirname
        }
      }
    },//, 'watch'
    concurrent: {
      tasks: ['nodemon'],
      options: {
        logConcurrentOutput: true
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec',
        require: 'server.js'
      },
      src: ['test/*.js']
    },
    env: {
      test: {
        NODE_ENV: 'test'
      }
    }
  });

  //Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('assemble');

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  if (process.env.NODE_ENV === 'production') {
    grunt.registerTask('default', ['jshint', 'csslint', 'cssmin', 'uglify', 'concurrent']);
  } else {
    grunt.registerTask('default', ['concurrent']);
  }

  //Test task.
  grunt.registerTask('test', ['env:test', 'mochaTest']);
};
