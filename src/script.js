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

var $, consoles, c2, c3, c4;
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

    c4 = new _consoles( $( '#test-4 .consoles' ).get(0) );
    $( '#test-4' ).on( 'load', function() {
        c4.log( `test 04 [animation] init.` );

        require( [ './lib/animation/animation.js' ], function() {
            c4.log( `library of animation.js loaded.` );
            var ani = new animation( 'animation-canvas' );
            ani.fps = 60;
            ani.width = 750;
            ani.height = 450;

            $( '.animation-parse' ).on( 'click', function() {
                ani.stop();
            } );
            $( '.animation-run' ).on( 'click', function() {
                ani.run();
            } );
            $( '.jump-ball' ).on( 'click', function() {
                var x = 0, xp = 1, xt = 6;
                var y = 0, yp = 1, yt = 6;

                var _his = [];

                ani.stop();
                ani.loop = function( ctx ) {
                    var _c = ctx.context;
                    _c.clearRect( 0, 0, 750, 450 );
                    _c.fillStyle = "black";
                    _c.fillText( `FPS: ${ani.fps}`, 10, 10 );
                    /*
                    _c.fillStyle = "green";
                    _c.beginPath();
                    _c.arc( x, y, 10, 0, 2 * Math.PI, true );
                    _c.fill();
                    */
                    x += xt * xp;
                    y += yt * yp;
                    if ( x > 750 ) {
                        xp = -1;
                        xt = Math.floor( Math.random() * 5 ) + 3;
                    }
                    if ( x < 0 ) {
                        xp = 1;
                        xt = Math.floor( Math.random() * 5 ) + 3;
                    }
                    if ( y > 450 ) {
                        yp = -1;
                        yt = Math.floor( Math.random() * 5 ) + 3;
                    }
                    if ( y < 0 ) {
                        yp = 1;
                        yt = Math.floor( Math.random() * 5 ) + 3;
                    }

                    if ( _his.length >= 20 ) {
                        _his.pop();
                    }
                    _his.unshift( [ x, y ] );

                    for ( var i = 0; i < _his.length; i++ ) {
                        _c.fillStyle = "rgba( 0, 0, 255, " + ( 1 - ( 1.0 / _his.length ) * i ) + ")";
                        _c.beginPath();
                        _c.arc( _his[i][0], _his[i][1], 10, 0, 2 * Math.PI, true );
                        _c.fill();
                    }
                }
                ani.run();
            } );

            $( '.ease-transition' ).on( 'click', function() {
                var _coos = [], _curr = 0;
                var _temp = [], _temp_step = [], _temp_curr = 0, _temp_frames = 180;
                var _stop = 0, _stop_frames = 180;

                // y = x
                _coos.push( [] );
                for ( var i = -50; i < 50; i++ ) {
                    _coos[_coos.length - 1].push( { x : i * .125, y : i * .125 } );
                }
                // y = sin(x)
                _coos.push( [] );
                for ( var i = -50; i < 50; i++ ) {
                    _coos[_coos.length - 1].push( { x : i * .125, y : Math.sin( i * .125 ) } );
                }
                // y = cos(x)
                _coos.push( [] );
                for ( var i = -50; i < 50; i++ ) {
                    _coos[_coos.length - 1].push( { x : i * .125, y : Math.cos( i * .125 ) } )
                }
                // y = tan(x)
                _coos.push( [] );
                for ( var i = -50; i < 50; i++ ) {
                    _coos[_coos.length - 1].push( { x : i * .125, y : Math.tan( i * .125 ) } )
                }
                // y = e^(x)
                _coos.push( [] );
                for ( var i = -50; i < 50; i++ ) {
                    _coos[_coos.length - 1].push( { x : i * .125, y : Math.exp( i * .125 ) } )
                }
                // y = x ^ 2
                _coos.push( [] );
                for ( var i = -50; i < 50; i++ ) {
                    _coos[_coos.length - 1].push( { x : i * .125, y : Math.pow( i * .125, 2 ) } )
                }
                // y = x ^ 3
                _coos.push( [] );
                for ( var i = -50; i < 50; i++ ) {
                    _coos[_coos.length - 1].push( { x : i * .125, y : Math.pow( i * .125, 3 ) } )
                }
                // y = x ^ -1
                _coos.push( [] );
                for ( var i = -50; i < 50; i++ ) {
                    _coos[_coos.length - 1].push( { x : i * .125, y : Math.pow( i * .125, -1 ) } )
                }

                var _labels = [ `y = x`, `y = sin( x )`, `y = cos( x )`, `y = tan( x )`, `y = e ^ x`, `y = x ^ 2`, `y = x ^ 3`, `y = x ^ -1` ];

                ani.stop();
                ani.loop = function( args ) {
                    var _c = args.context;
                    _c.clearRect( 0, 0, 750, 450 );
                    _c.fillStyle = "black";
                    _c.fillText( `FPS: ${ani.fps}`, 10, 10 );
                    _c.fillText( _labels[_curr] , 10, 30 );

                    var _u = function() {
                        return _curr;
                    }
                    var _n = function() {
                        return ( _curr + 1 ) == _coos.length ? 0 : _curr + 1;
                    }
                    var _p = function() {
                        return ( _curr - 1 ) == 0 ? _coos.length - 1 : _curr - 1;
                    }

                    if ( ! _stop ) {
                        if ( ! _temp_curr ) {
                            var _nv = _n();
                            var _cv = _u();
                            _temp = [];
                            _temp_step = [];
                            for ( var i = 0; i < 100; i++ ) {
                                _temp.push( { x : _coos[_cv][i].x, y : _coos[_cv][i].y } );
                            }
                            for ( var i = 0; i < 100; i++ ) {
                                _temp_step.push( { x : ( _coos[_nv][i].x - _coos[_cv][i].x ) * 1.0 / _temp_frames, y : ( _coos[_nv][i].y - _coos[_cv][i].y ) * 1.0 / _temp_frames } );
                            }
                            _temp_curr++;
                        } else {
                            if ( _temp_curr > _temp_frames ) {
                                _temp_curr = 0;
                                _curr = _n();
                                _stop = _stop_frames;
                            } else {
                                for ( var i = 0; i < 100; i++ ) {
                                    _temp[i].x += _temp_step[i].x;
                                    _temp[i].y += _temp_step[i].y;
                                }
                                _temp_curr++;
                            }
                        }
                    } else {
                        _stop--;
                    }

                    _c.fillStyle = "#0093ff";
                    for ( var i = 0; i < 100; i++ ) {
                        _c.beginPath();
                        _c.arc( _temp[i].x * 8 * 7.5 + 375, _temp[i].y * 8 * 7.5 * -1 + 225, 5, 0, 2 * Math.PI, true );
                        _c.fill();
                    }
                }

                ani.run();
            } );

            $( '.clock' ).on( 'click', function() {
                var _stack = [];

                ani.off( 'run' ).on( 'run', function() {
                    _stack = [];
                } )

                ani.stop();
                ani.loop = function( args ) {
                    var _c = args.context;
                    _c.clearRect( 0, 0, 750, 450 );
                    _c.fillStyle = "black";
                    _c.font = "12px";
                    _c.fillText( `FPS: ${ani.fps}`, 10, 10 );

                    _c.strokeStyle = "rgb( 227, 227, 227 )";
                    _c.beginPath();
                    _c.arc( 375, 225, 200, 0, 2 * Math.PI, true );
                    _c.stroke();
                    /*
                    _c.beginPath();
                    _c.arc( 375, 225, 206, 0, 2 * Math.PI, true );
                    _c.stroke();
                    _c.beginPath();
                    _c.arc( 375, 225, 194, 0, 2 * Math.PI, true );
                    _c.stroke();
                    */

                    _c.beginPath();
                    _c.arc( 375, 225, 162, 0, 2 * Math.PI, true );
                    _c.stroke();

                    /*
                    _c.beginPath();
                    _c.arc( 375, 225, 168, 0, 2 * Math.PI, true );
                    _c.stroke();
                    _c.beginPath();
                    _c.arc( 375, 225, 156, 0, 2 * Math.PI, true );
                    _c.stroke();
                    */

                    _c.beginPath();
                    _c.arc( 375, 225, 124, 0, 2 * Math.PI, true );
                    _c.stroke();
                    /*
                    _c.beginPath();
                    _c.arc( 375, 225, 130, 0, 2 * Math.PI, true );
                    _c.stroke();
                    _c.beginPath();
                    _c.arc( 375, 225, 118, 0, 2 * Math.PI, true );
                    _c.stroke();
                    */

                    var _r1 = 200, _r2 = 162, _r3 = 124;

                    var _n = new Date();
                    var _h = _n.getHours(), _m = _n.getMinutes(), _s = _n.getSeconds(), _ms = _n.valueOf() % 1000;
                    var _hour = _h % 12 + _m * .0166666667 + _s * .0002777778;
                    var _minute = _m + _s * .0166666667 + _ms * .0000166667;
                    var _second = _s + _ms * .001;

                    var _hour_arc = _hour / 12.0 * 2 * Math.PI;
                    var _hour_x = _r1 * Math.sin( _hour_arc );
                    var _hour_y = _r1 * Math.cos( _hour_arc );

                    var _minute_arc = _minute / 60.0 * 2 * Math.PI;
                    var _minute_x = _r2 * Math.sin( _minute_arc );
                    var _minute_y = _r2 * Math.cos( _minute_arc );

                    var _second_arc = _second / 60.0 * 2 * Math.PI;
                    var _second_x = _r3 * Math.sin( _second_arc );
                    var _second_y = _r3 * Math.cos( _second_arc );

                    if ( _stack.length > 300 ) {
                        _stack.pop();
                    }
                    _stack.unshift( {
                        second_x : _second_x,
                        second_y : _second_y,
                    } );

                    for ( var i = 0; i < _stack.length; i++ ) {
                        // _c.arc( _second_x + 375, _second_y + 225, 5, 0, 2 * Math.PI, true );
                        _c.fillStyle = `rgb( ${Math.floor(i * .85)}, ${174 + Math.floor(i * .36)}, 255 )`;
                        _c.beginPath();
                        _c.arc( _stack[i].second_x + 375, -_stack[i].second_y + 225, ( 5 - Math.min( 4.99, i * 0.016667 ) ), 0, 2 * Math.PI, true );
                        _c.fill();
                    }
                    
                    _c.fillStyle = "rgb( 0, 73, 128 )";
                    _c.beginPath();
                    _c.arc( _minute_x + 375, -_minute_y + 225, 10, 0, 2 * Math.PI, true );
                    _c.fill();
                    _c.fillStyle = "#fff";
                    _c.font = "8px";
                    _c.fillText( Math.floor( _minute ), _minute_x + 375 - 4 - ( _minute >= 10 ? 4 : 0 ), -_minute_y + 225 + 4 );

                    _c.fillStyle = "rgb( 0, 36, 64 )";
                    _c.beginPath();
                    _c.arc( _hour_x + 375, -_hour_y + 225, 12, 0, 2 * Math.PI, true );
                    _c.fill();
                    _c.fillStyle = "#fff";
                    _c.font = "8px";
                    _c.fillText( Math.floor( _hour ), _hour_x + 375 - 4 - ( _hour >= 10 ? 4 : 0 ), -_hour_y + 225 + 5 );
                }
                ani.run();
            } )
        } )
    } )
} );
