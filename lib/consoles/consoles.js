"use strict"

define( "consoles", [ "jquery" ], function( $ ) {

    var consoles = function( ele ) {
        consoles.__ele = ele || document.querySelector( '.consoles' );
        consoles.__init();

        return consoles;
    }

    consoles.__proto__ = {
        __ele : null,
        __logs : [],
        __init : function() {
            var $e = $( consoles.__ele );
            $e.on( 'mousedown', function() {
                consoles._c_mouse_down = true;
            } );
            $e.on( 'mouseup', function() {
                consoles._c_mouse_down = false;
            } );
            $( document ).on( 'mousemove', function( e ) {
                if ( consoles._c_mouse_down ) {
                    $e.css( 'right', parseFloat( $e.css( 'right' ) ) + ( e.originalEvent.movementX * -1 ) + "px" );
                    $e.css( 'bottom', parseFloat( $e.css( 'bottom' ) ) + ( e.originalEvent.movementY * -1 ) + "px" );
                }
            } );
            $e.on( 'touchstart', function( e ) {
                consoles._c_touch = e.originalEvent.touches[0];
            } );
            $e.on( 'touchend', function( e ) {
                delete consoles._c_touch;
            } );
            $e.on( 'touchmove', function( e ) {
                var _curr = e.originalEvent.touches[0];
                if ( consoles._c_touch ) {
                    $e.css( 'right', parseFloat( $e.css( 'right' ) ) + ( ( _curr.clientX - consoles._c_touch.clientX ) * -1 ) + "px" );
                    $e.css( 'bottom', parseFloat( $e.css( 'bottom' ) ) + ( ( _curr.clientY - consoles._c_touch.clientY ) * -1 ) + "px" );
                }
                consoles._c_touch = _curr;
            } );
        },
        show : function () {
            var $e = $( consoles.__ele );
            $e.removeClass( 'consoles-hide' );
        },
        hide: function () {
            var $e = $( consoles.__ele );
            $e.addClass( 'consoles-hide' );
        },
        clean : function() {
            consoles.__logs = [];
            var $e = $( consoles.__ele );
            $e.html( '' );
        },
        log : function( str ) {
            var $e = $( consoles.__ele );
            var time = new Date();
            var time_str = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
            consoles.__logs.push( {
                'time' : time,
                'text' : str,
            } );

            $e.html( $e.html() + `<p>[${time_str}] ${str}</p>` );
            $e.scrollTop( 999999999 );
        }
    }

    return consoles();

} );
