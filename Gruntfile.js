'use strict';

module.exports = function(grunt) {
    var nodeSass = require('node-sass');

    // Load any grunt plugins found in package.json.
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        dirs: {
            dest: '_site',
            src: 'src',
            tmp: '.tmp'
        },

        // Copy files that don't need compilation to _site/
        copy: {
            index: {
                files: [{
                    dest: '<%= dirs.tmp %>/',
                    src: [
                        'index.html'
                    ],
                    filter: 'isFile',
                    expand: true,
                    cwd: '<%= dirs.src %>/'
                }]
            },
            other: {
                files: [{
                    dest: '<%= dirs.dest %>/',
                    src: [
                        '*',
                        '!index.html'
                    ],
                    filter: 'isFile',
                    dot: true,
                    expand: true,
                    cwd: '<%= dirs.src %>/'
                }]
            },
            img: {
                files: [{
                    dest: '<%= dirs.dest %>/',
                    src: 'img/**',
                    expand: true,
                    cwd: '<%= dirs.src %>/'
                }]
            }
        },

        sass: {
            options: {
                implementation: nodeSass,
                includePaths: ['./node_modules'],
                precision: 6,
                sourceMap: false
            },
            dist: {
                src: '<%= dirs.src %>/css/main.scss',
                dest: '<%= dirs.tmp %>/css/main.css'
            }
        },

        concat: {
            js: {
                src: [
                    '<%= dirs.src %>/js/main.js',
                    '<%= dirs.src %>/js/google-analytics.js'
                ],
                dest: '<%= dirs.tmp %>/js/main.js'
            }
        },

        postcss: {
            options: {
                processors: [
                    require('postcss-combine-duplicated-selectors')(),
                    require('autoprefixer')()
                ]
            },
            dist: {
                src: '<%= sass.dist.dest %>'
            }
        },

        purgecss: {
            dist: {
                options: {
                    content: [
                        '<%= dirs.tmp %>/**/*.html',
                        '<%= dirs.tmp %>/js/**/*.js'
                    ]
                },
                files: {
                    '<%= sass.dist.dest %>': ['<%= sass.dist.dest %>']
                }
            }
        },

        staticinline: {
            dist: {
                options: {
                    basepath: '<%= dirs.tmp %>/'
                },
                files: [{
                    expand: true,
                    cwd: '<%= dirs.tmp %>/',
                    src: '*.html',
                    dest: '<%= dirs.tmp %>/'
                }]
            },
            dev: {
                options: {
                    basepath: '<%= dirs.tmp %>/'
                },
                files: [{
                    expand: true,
                    cwd: '<%= dirs.tmp %>/',
                    src: '*.html',
                    dest: '<%= dirs.dest %>/'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    conservativeCollapse: false,
                    decodeEntities: true,
                    minifyCSS: {
                        level: {
                            1: {
                                specialComments: 0
                            }
                        }
                    },
                    minifyJS: true,
                    minifyURLs: false,
                    processConditionalComments: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeOptionalAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    removeTagWhitespace: false,
                    sortAttributes: true,
                    sortClassName: true
                },
                expand: true,
                cwd: '<%= dirs.tmp %>',
                dest: '<%= dirs.dest %>',
                src: [
                    '*.html',
                    '!404.html'
                ]
            }
        },

        eslint: {
            options: {
                config: '.eslintrc.json'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: [
                    '<%= dirs.src %>/js/*.js'
                ]
            }
        },

        htmllint: {
            options: {
                ignore: 'CSS: “size”: Property “size” doesn\'t exist.'
            },
            src: [
                '<%= dirs.dest %>/*.html',
                '!<%= dirs.dest %>/google*.html'
            ]
        },

        connect: {
            options: {
                hostname: 'localhost',
                livereload: 35729,
                port: 8001
            },
            livereload: {
                options: {
                    base: '<%= dirs.dest %>/',
                    open: true  // Automatically open the webpage in the default browser
                }
            }
        },

        watch: {
            options: {
                livereload: '<%= connect.options.livereload %>'
            },
            dev: {
                files: ['<%= dirs.src %>/**', 'Gruntfile.js'],
                tasks: 'build:dev'
            },
            build: {
                files: ['<%= dirs.src %>/**', 'Gruntfile.js'],
                tasks: 'build'
            }
        },

        clean: {
            tests: [
                '<%= dirs.tmp %>/',
                '<%= dirs.dest %>/'
            ]
        },

        'gh-pages': {
            options: {
                base: '<%= dirs.dest %>'
            },
            src: ['**']
        }
    });

    grunt.registerTask('build:dev', [
        'clean',
        'copy',
        'concat',
        'sass',
        'postcss',
        'staticinline:dev'
    ]);

    grunt.registerTask('build', [
        'clean',
        'copy',
        'concat',
        'sass',
        'postcss',
        'purgecss',
        'staticinline',
        'htmlmin'
    ]);

    grunt.registerTask('test', [
        'build',
        'eslint',
        'build',
        'htmllint'
    ]);

    grunt.registerTask('deploy', [
        'build',
        'gh-pages'
    ]);

    grunt.registerTask('default', [
        'build:dev',
        'connect',
        'watch:dev'
    ]);

    grunt.registerTask('server', [
        'build',
        'connect',
        'watch:build'
    ]);
};
