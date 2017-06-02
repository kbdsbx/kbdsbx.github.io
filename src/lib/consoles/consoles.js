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
                    $e.css( 'right', parseInt( $e.css( 'right' ) ) + ( e.originalEvent.movementX * -1 ) + "px" );
                    $e.css( 'bottom', parseInt( $e.css( 'bottom' ) ) + ( e.originalEvent.movementY * -1 ) + "px" );
                }
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
