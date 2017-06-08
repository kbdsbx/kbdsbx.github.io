"use strict"

require.config({
    paths: {
        jquery: './lib/jquery/jquery',
        consoles: './lib/consoles/consoles',
        spume : './tests/supme/spume.js',
    },
    shim : {
        'jquery' : {
            exports : 'jquery',
        },
        'consoles' : {
            exports : 'consoles',
            deps : [ 'jquery' ],
        }
    }
})

var $, consoles, c2, c3;
require( [ "jquery", "consoles" ], function( _jquery, _consoles ) {
    $ = _jquery;

    var _resize = function() {
        $( '.main-section' )
            .width( $( window ).width() )
            .height( $( window ).height() );
            ;
        $( '.main' )
            .width( $( window ).width() )
            .css( 'min-height', $( window ).height() );
    }

    $( window ).on( 'resize', _resize );
    $( window ).on( 'load', function() {
        _resize();

        $( '.main-section.loading' ).removeClass( 'loading' );
    } );

    if ( window.location.hash ) {
        var _hash = window.location.hash.substr( 1 );
        setTimeout( function() {
            $( '.main-section' ).addClass( 'hide' );
            $( window.location.hash ).addClass( 'show' );
            $( '.main-section .next-box' ).removeClass( 'show' ).addClass( 'never' );
            $( '.nav' ).addClass( 'show' );
            $( '.nav li a[href="' + window.location.hash + '"]').parent().addClass( 'active' );
            $( '.nav' ).addClass( _hash + '-bg' );

            $( '.contents' ).trigger( 'change', [ window.location.hash, null ] );
        }, 400 );
    }

    $( document ).ready( function() {
        setTimeout( function() {
            if ( $( '.main-section .next-box' ).is( ':not(.never)' ) ) {
                $( '.main-section .next-box' ).addClass( 'show' );
            }
        }, 2000 );
    } );

    $( window ).on( 'mousewheel touchstart', function() {
        $( '.main-section .next-box' ).removeClass( 'show' ).addClass( 'never' );

        if ( $( '.nav' ).is( ':not(.show)' ) ) {
            $( '.nav' ).addClass( 'show' );
        }
    } );

    $( window ).on( 'scroll', function() {
    } );

    $( '.nav a' ).on( 'click', function( e ) {
        var _new = $( this ).attr( 'href' );
        if ( $( _new ).length <= 0 ) {
            return false;
        }
        var _old = '#' + $( '.section.show' ).attr( 'id' );
        if ( $( _old ).length <= 0 ) {
            $( '.main-section' ).addClass( 'hide' );
        }

        $( '.nav li' ).removeClass( 'active' );
        $( this ).parent( 'li' ).addClass( 'active' );
        var _hash = _new.substr( 1 );
        $( '.nav' ).removeClass( 'product-bg, project-bg' ).addClass( _hash + '-bg' );

        $( '.contents' ).trigger( 'change', [ _new, _old ] );

        window.location.hash = _new;
        $( _old ).removeClass( 'show' ).addClass( 'hide' );
        $( _new ).removeClass( 'hide' ).addClass( 'show' );
        return false;
    } );

    $( '.nav a.return-btn' ).on( 'click', function() {
        $( '.nav-content.nav-main' ).removeClass( 'hide' );
        $( '.nav-content.nav-sub' ).addClass( 'hide' );

        return false;
    } );

    $( '.nav a[data-panel]' ).on( 'click', function() {
        var _new = '#' + $( this ).data( 'panel' );
        if ( $( _new ).length <= 0 ) {
            return false;
        }

        var _old = '#' + $( '.section .panel.show' ).attr( 'id' );
        $( '.nav li' ).removeClass( 'active' );
        $( this ).parent( 'li' ).addClass( 'active' );

        $( _old ).removeClass( 'show' );
        $( _new ).addClass( 'show' );

        $( '.section#testboard' ).trigger( 'change', [ _new, ( _old == '#' ? null : _old ) ] );

        return false;
    } );

    $( '.contents' ).on( 'change', function( e, _new, _old ) {
        if ( _new == '#testboard' ) {
            setTimeout( function() {
                $( '.nav-content.nav-main' ).addClass( 'hide' );
                $( '.nav-content.nav-sub' ).removeClass( 'hide' );
            }, _new == _old ? 0 : 1000 );
        }
    } );

    $( '#testboard' ).on( 'change', function( e, _new, _old ) {
        var $e = $( _new );

        if ( $e.data( 'test_loaded' ) ) {
            return;
        } else {
            $e.trigger( 'load' );
            $e.data( 'test_loaded', true );
        }

        $e.trigger( 'show' );
    } );

    $( '.btns .btn' ).on( 'click', function() {
        $( this ).parents( '.btns' ).find( '.active' ).removeClass( 'active' );
        $( this ).addClass( 'active' );
    } );

    consoles = new _consoles( $( '#test-1 .consoles' ).get(0) );
    $( '#test-1' ).on( 'load', function() {
        consoles.log( 'test 01 [抹除图片] init...' );

        require( [ './tests/spume/spume.js' ], function() {
            consoles.log( 'spume.js loaded.' );
            consoles.log( '请在左侧白框区域内涂抹' );
        } )
    } );

    $( '#test-1' ).on( 'show', function() {
        consoles.log( 'test 01 shown.' );
    } );

    c2 = new _consoles( $( '#test-2 .consoles' ).get(0) );
    $( '#test-2' ).on( 'load', function() {
        c2.log( 'test 02 [effects] init...' );

        require( [ './lib/img/img.js', './tests/effect/effect.js' ], function() {
            c2.log( 'effect.js loaded.' );

            var img = new Img(
                './images/0046.jpg',
                parseInt( $( '#effect-canvas' ).attr( 'width' ) ),
                parseInt( $( '#effect-canvas' ).attr( 'height' ) ),
                function() {
                    c2.log( `image [${img.path}] loaded; w: ${this.width} h: ${this.height}` );

                    var _can = $( '#effect-canvas' ).get(0);
                    img
                        .draw( _can );

                    $( '#test-2 .btn.reset' ).on( 'click', function() {
                        img
                            .reset()
                            .draw( _can );

                        c2.log( `reset.` );
                    } );
                    $( '#test-2 .btn.grayed' ).on( 'click', function() {
                        img
                            .reset()
                            .pipe( Effect.grayed )
                            .draw( _can );

                        c2.log( `grayed.` );
                    } );
                    $( '#test-2 .btn.edge' ).on( 'click', function() {
                        img
                            .reset()
                            .pipe( Effect.grayed )
                            .pipe( Effect.sobel )
                            .draw( _can );

                        c2.log( `edge used as sobeloperator.` );
                    } );
                    $( '#test-2 .btn.edge2' ).on( 'click', function() {
                        img
                            .reset()
                            .pipe( Effect.grayed )
                            .pipe( Effect.sobel2 )
                            .draw( _can );

                        c2.log( `edge with 45° used as sobeloperator.` );
                    } );

                    var bools_event = function() {
                        var _v = $( '#test-2 .sub-opts [name="bools-range"]' ).val();
                        img
                            .reset()
                            .pipe( Effect.grayed )
                            .pipe( Effect.bools, { range: _v } )
                            .draw( _can );

                        c2.log( `bools separate with ${_v}.` );
                    };
                    $( '#test-2 .sub-opts [name="bools-range"]' ).on( 'change', bools_event );
                    $( '#test-2 .btn.bools' ).on( 'click', bools_event );

                    $( '#test-2 .btn.layering' ).on( 'click', function() {
                        img
                            .reset()
                            .pipe( Effect.grayed )
                            .pipe( Effect.layering )
                            .draw( _can );

                        c2.log( `layering.` );
                    } );
                    $( '#test-2 .btn.relievo' ).on( 'click', function() {
                        img
                            .reset()
                            .pipe( Effect.relievo )
                            .pipe( Effect.grayed )
                            .draw( _can );

                        c2.log( `relievo.` );
                    } );
                    $( '#test-2 .btn.oil' ).on( 'click', function() {
                        c2.log( `time for oily effect processing is longer, please patiently ...` );

                        setTimeout( function() {
                            img
                                .reset()
                                .pipe( Effect.oil )
                                .draw( _can );

                            c2.log( `oily.` );
                        }, 100 )
                    } );

                    var gauss_blur_event = function() {
                        var _v = $( '#test-2 .sub-opts [name="gauss-blur-range"]' ).val();

                        if ( _v >= 5 ) {
                            c2.log( `Gauss blur with ${_v} range which processing is longer, please patiently ...` );
                        }

                        setTimeout( function() {
                            
                            img
                                .reset()
                                .pipe( Effect.gauss_blur, { range: _v } )
                                .draw( _can );

                            c2.log( `Gauss blur with ${_v}.` );
                            if ( _v >= 5 ) {
                                c2.log( `如果你看不清左面的图片，请注意身体，不要撸太多哦。` );
                            }
                        }, 100 );
                    }

                    $( '#test-2 .btn.gauss_blur' ).on( 'click', gauss_blur_event );
                    $( '#test-2 .sub-opts [name="gauss-blur-range"]' ).on( 'change', gauss_blur_event );

                    var blur_event = function() {
                        var _v = $( '#test-2 .sub-opts [name="blur-range"]' ).val()

                        if ( _v >= 5 ) {
                            c2.log( `blur with ${_v} range which processing is longer, please patiently ...` );
                        }

                        setTimeout( function() {

                            img
                                .reset()
                                .pipe( Effect.blur, { range : _v } )
                                .draw( _can );

                            c2.log( `blur range with ${_v}.` );

                            if ( _v >= 5 ) {
                                c2.log( `如果你看不清左面的图片，请注意身体，不要撸太多哦。` );
                            }
                        }, 100 );
                    }
                    $( '#test-2 .btn.blur' ).on( 'click', blur_event );
                    $( '#test-2 .sub-opts [name="blur-range"]' ).on( 'change', blur_event );

                    $( '#test-2 .btn.glow' ).on( 'click', function() {
                        img
                            .reset()
                            .pipe( Effect.glow )
                            .draw( _can );

                        c2.log( `glow.` );
                    } );
                    $( '#test-2 .btn.inverse' ).on( 'click', function() {
                        img
                            .reset()
                            .pipe( Effect.inverse )
                            .draw( _can );

                        c2.log( `inverse.` );
                    } );
                    $( '#test-2 .btn.sketch' ).on( 'click', function() {
                        img
                            .reset()
                            .pipe( Effect.sketch )
                            .draw( _can );

                        c2.log( `sketch.` );
                    } );
                    $( '#test-2 .btn.wave' ).on( 'click', function() {
                        var _r = 1;
                        // setInterval( function() {
                            img
                                .reset()
                                .pipe( Effect.wave, { radian : _r } )
                                .draw( _can );
                            _r += 1;
                        // }, 15 );

                        c2.log( `wave.` );
                    } );
                } );
        } )
    } );

    c3 = new _consoles( $( '#test-3 .consoles' ).get(0) );
    $( '#test-3' ).on( 'load', function() {
        c3.log( `test 03 [font] init.` );

        require( [ './lib/fonts/fonts.js' ], function() {
            c3.log( `library of fonts.js loaded.` );
            var worker = new Worker( "./tests/fonts/fonts.js" );
        } );
            /*
        require( [ './tests/fonts/fonts.js' ], function() {
            c3.log( `fonts.js loaded.` );


            var f = new Fonts( "./fonts/BahiaScriptSSK.ttf", function( data ) {
            } );
        } )
        */
    } );
} );
