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

var $, consoles;
require( [ "jquery", "consoles" ], function( _jquery, _consoles ) {
    $ = _jquery;
    consoles = _consoles;

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

    $( window ).on( 'mousewheel', function() {
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
        $( '.nav li' ).removeClass( 'active' );
        $( this ).parent( 'li' ).addClass( 'active' );
        var _hash = _new.substr( 1 );
        $( '.nav' ).removeClass( 'product-bg, project-bg' ).addClass( _hash + '-bg' );

        if ( !_old ) {
            $( '.main-section' ).addClass( 'hide' );
        }

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

    $( '#test-1' ).on( 'load', function() {
        consoles.log( 'test 01 [抹除图片] init...' );

        require( [ './tests/spume/spume.js' ], function() {
            consoles.log( 'spume.js loaded' );
            consoles.log( '请在左侧白框区域内涂抹' );
        } )
    } );

    $( '#test-1' ).on( 'show', function() {
        consoles.log( 'test 01 shown.' );
    } );

} );
