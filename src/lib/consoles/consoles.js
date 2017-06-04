"use strict"

define( "consoles", [ "jquery" ], function( $ ) {

    var consoles = function( ele ) {
        this.__ele = ele;
        this.__init();

        return this;
    }

    consoles.prototype = {
        __ele : null,
        __logs : [],
        __init : function() {
            var $e = $( this.__ele );
   
            $e.on( 'mousedown', function() {
                $e._c_mouse_down = true;
            } );
            $e.on( 'mouseup', function() {
                $e._c_mouse_down = false;
                $e._c_resize = false;
            } );
            $( document ).on( 'mousemove', function( e ) {
                if ( $e._c_resize ) {
                    $e.trigger( 'resize', {
                        type : $e._c_resize,
                        movementX : e.originalEvent.movementX,
                        movementY : e.originalEvent.movementY,
                    } );
                    return;
                }
                if ( $e._c_mouse_down ) {
                    $e.css( 'right', parseFloat( $e.css( 'right' ) ) + ( e.originalEvent.movementX * -1 ) + "px" );
                    $e.css( 'bottom', parseFloat( $e.css( 'bottom' ) ) + ( e.originalEvent.movementY * -1 ) + "px" );
                }
            } );
            $e.on( 'touchstart', function( e ) {
                this._c_touch = e.originalEvent.touches[0];
            } );
            $e.on( 'touchend', function( e ) {
                delete this._c_touch;
            } );
            $e.on( 'touchmove', function( e ) {
                var _curr = e.originalEvent.touches[0];
                if ( this._c_touch ) {
                    $e.css( 'right', parseFloat( $e.css( 'right' ) ) + ( ( _curr.clientX - this._c_touch.clientX ) * -1 ) + "px" );
                    $e.css( 'bottom', parseFloat( $e.css( 'bottom' ) ) + ( ( _curr.clientY - this._c_touch.clientY ) * -1 ) + "px" );
                }
                this._c_touch = _curr;
            } );
         
            $( `<div class="consoles-n"></div>
                <div class="consoles-s"></div>
                <div class="consoles-w"></div>
                <div class="consoles-e"></div>
                <div class="consoles-nw"></div>
                <div class="consoles-ne"></div>
                <div class="consoles-sw"></div>
                <div class="consoles-se"></div>` )
                .appendTo( $e );

            $e.find( '[class|="consoles"]' )
                .on( 'mousedown', function( e ) {
                    $e._c_resize = $( this ).attr( 'class' );
                } );

            $e.on( 'resize', function( e, pos ) {
                var _pos = pos.type.substr( pos.type.indexOf( '-' ) + 1 );
                if ( _pos.indexOf( 's' ) !== -1 ) {
                    $e.css( 'bottom', parseInt( $e.css( 'bottom' ) ) - pos.movementY + "px" );
                    $e.css( 'height', $e.outerHeight() + pos.movementY );
                }
                if ( _pos.indexOf( 'n' ) !== -1 ) {
                    $e.css( 'height', $e.outerHeight() - pos.movementY );
                }
                if ( _pos.indexOf( 'e' ) !== -1 ) {
                    $e.css( 'right', parseInt( $e.css( 'right' ) ) - pos.movementX + "px" );
                    $e.css( 'width', $e.outerWidth() + pos.movementX );
                }
                if ( _pos.indexOf( 'w' ) !== -1 ) {
                    $e.css( 'width', $e.outerWidth() - pos.movementX );
                }
            } );

        },
        show : function () {
            var $e = $( this.__ele );
            $e.removeClass( 'consoles-hide' );
        },
        hide: function () {
            var $e = $( this.__ele );
            $e.addClass( 'consoles-hide' );
        },
        clean : function() {
            this.__logs = [];
            var $e = $( this.__ele );
            $e.html( '' );
        },
        log : function( str ) {
            var $e = $( this.__ele );
            var time = new Date();
            var time_str = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
            this.__logs.push( {
                'time' : time,
                'text' : str,
            } );

            $e.append( `<p>[${time_str}] ${str}</p>` );
            $e.scrollTop( 999999999 );
        }
    }

    return consoles;

} );
