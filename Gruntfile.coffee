coffee = require 'coffee-script'
fs = require 'fs'

module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON('package.json')

        # watch
        watch:
            jade:
                files: ['frontend/src/**/*.jade']
                tasks: ['jade']
                options:
                    interrupt: true
            scss:
                files: ['frontend/src/css/**/*.scss']
                tasks: ['compass']
                options:
                    interrupt: true
            js:
                files: ['frontend/src/js/**/*.js', 'frontend/src/js/**/*.coffee']
                tasks: ['concat:main', 'uglify:main']
                options:
                    interrupt: true

        # jade
        jade:
            options:
                preserveComments: false
            main:
                files:
                    'frontend/httpdocs/index.html': [
                        'frontend/src/index.jade'
                    ],
                    'frontend/httpdocs/pop/twitter_success.html': [
                        'frontend/src/pop/twitter_success.jade'
                    ]

        # concat
        concat:
            options: # parse coffee files when needed
                process: (src, filepath)->
                    if filepath.match(/\.coffee$/)
                        src = coffee.compile(src)
                    return src
            main:
                files:
                    'frontend/httpdocs/js/twitterfontana.min.js': [
                        'frontend/src/js/*.js'
                        'frontend/src/js/*.coffee'
                    ]
                    'frontend/httpdocs/js/lib.min.js': [
                        'frontend/src/js/lib/*'
                    ]

        # uglify
        uglify:
            options:
                preserveComments: false
            main:
                files:
                    'frontend/httpdocs/js/twitterfontana.min.js': 'frontend/httpdocs/js/twitterfontana.min.js'
                    'frontend/httpdocs/js/lib.min.js': 'frontend/httpdocs/js/lib.min.js'

        # compile sass to css
        compass:
            main:
                options:
                    sassDir: 'frontend/src/css'
                    cssDir: 'frontend/httpdocs/css'
                    relativeAssets: false
                    noLineComments: true
                    force: true
                    outputStyle: 'compressed'

    # tasks
    grunt.registerTask('default', ['watch'])

    # include
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-compass'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-jade'
