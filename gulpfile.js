"use strict"

var gulp = require( 'gulp' );
var htmlreplace = require( 'gulp-html-replace' );
var less = require( 'gulp-less' );
var minifycss = require( 'gulp-csso' );
var clean = require( 'gulp-clean' );
var notify = require( 'gulp-notify' );

gulp.task( 'clean', function() {
    gulp.src( '**/*.*~', { read : false } )
        .pipe( clean() );
    gulp.src( '**/.*~', { read : false } )
        .pipe( clean() );
} );

gulp.task( 'lib', function() {
    gulp.src( 'node_modules/requirejs/require.js' )
        .pipe( gulp.dest( 'src/lib/require/' ) );
    gulp.src( 'node_modules/jQuery/tmp/jquery.js' )
        .pipe( gulp.dest( 'src/lib/jquery/' ) );
} );

gulp.task( 'default', [ 'clean', 'lib' ], function() {
    var i = 0;

    var end = function() {
        i++;
        if ( i == 8 ) {
            gulp.src( 'src/index.html', { read : false } )
                .pipe( notify( 'Build successful.' ) );
        }
    }

    gulp.src( 'src/lib/**/*' )
        .pipe( gulp.dest( 'lib/' ) )
        .on( 'end', end );
    gulp.src( 'src/images/**/*' )
        .pipe( gulp.dest( 'images/' ) )
        .on( 'end', end );
    gulp.src( 'src/data/**/*' )
        .pipe( gulp.dest( 'data/' ) )
        .on( 'end', end );

    gulp.src( 'src/tests/**/*' )
        .pipe( gulp.dest( 'tests/' ) )
        .on( 'end', end );

    gulp.src( 'src/*.html' )
        .pipe( htmlreplace( {
            js : {
                src: 'http://cdn.bootcss.com/less.js/2.7.2/less.js',
                tpl: '<!-- clean up: %s -->',
            },
            less : {
                src: 'style.less',
                tpl: '<link rel="stylesheet" data-form="%s" type="text/css" href="style.css">',
            }
        } ) )
        .pipe( gulp.dest( './' ) )
        .on( 'end', end );

    gulp.src( 'src/style.less' )
        .pipe( less() )
        .pipe( minifycss() )
        .pipe( gulp.dest( './' ) )
        .on( 'end', end );

    gulp.src( 'src/*.ico' )
        .pipe( gulp.dest( './' ) )
        .on( 'end', end );
    gulp.src( 'src/*.js' )
        .pipe( gulp.dest( './' ) )
        .on( 'end', end );
} );
