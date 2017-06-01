"use strict"

var gulp = require( 'gulp' );
var htmlreplace = require( 'gulp-html-replace' );
var less = require( 'gulp-less' );
var minifycss = require( 'gulp-csso' );
var clean = require( 'gulp-clean' );

gulp.task( 'clean', function() {
    gulp.src( '**/*.*~', { read : false } )
        .pipe( clean() );
    gulp.src( '**/.*~', { read : false } )
        .pipe( clean() );
} );

gulp.task( 'default', [ 'clean' ], function() {
    gulp.src( 'src/lib/*' )
        .pipe( gulp.dest( 'lib' ) );
    gulp.src( 'src/images/**/*' )
        .pipe( gulp.dest( 'images' ) );
    gulp.src( 'src/data/**/*' )
        .pipe( gulp.dest( 'data' ) );

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
        .pipe( gulp.dest( './' ) );

    gulp.src( 'src/style.less' )
        .pipe( less() )
        .pipe( minifycss() )
        .pipe( gulp.dest( './' ) );

    gulp.src( 'src/*.ico' )
        .pipe( gulp.dest( './' ) );
    gulp.src( 'src/*.js' )
        .pipe( gulp.dest( './' ) );
} );
