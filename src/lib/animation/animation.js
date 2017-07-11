
class animation {
    constructor ( id ) {
        var _this = this;
        if ( id ) {
            this.$ele = document.getElementById( id );
            this.$context = this.$ele.getContext( '2d' );
        }

        this._rotate_rate = 1;
        this._width = 0;
        this._height = 0;
        this._events = {};

        this._frame = 16.66667;
        this._animation_frame = function( func ) {
            if ( window ) {
                window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

                return window.requestAnimationFrame( func );
            } else {
                return setInterval( function() {
                    func( Date.now().valueOf() );
                } );
            }
        };
        this._cancel_frame = function( rid ) {

        } window ? ( window.cancelAnimationFrame || window.webkitCancelAnimationFrame ) : function( rid ) { clearInterval( rid ); };
        this._loop = () => {};
    }

    _sc( v ) {
        return v * this._rotate_rate;
    }

    // set width but isn't real
    set width( w ) {
        this._width = w;
    }
    
    // set height but isn't real
    set height( h ) {
        this._height = h;
    }

    get width() {
        return this._sc( this._width );
    }

    get height() {
        return this._sc( this._height );
    }

    // set rotate rate.
    set rotateRate( r ) {
        this._rotate_rate = r;
        // todo: reset everything.
    }

    // main loop
    set loop( l ) {
        this._loop = l;
    }

    // fps
    set fps( f ) {
        this._frame = 1000.0 / f;
    }

    run() {
        var _this = this;
        _this._prev_tick = 0;
        _this._fid = _this._animation_frame( function( time ) {
            if ( ( time - _prev_tick ) >= _this._frame ) {
                _this._loop.call( _this, { timestamp : time, context : _this.$context } );
                _this._prev_tick = time;
            }
        } );

        return this;
    }

    stop() {
        this._cancel_frame( this._fid );

        return this;
    }

    bind ( evt, handle ) {
        let _this = this;

        if ( ! _this._events[evt] ) {
            _this._events[evt] = [];

            let _tfunc = ( e ) => {
                for ( let idx in _this._events[evt] ) {
                    _this._events[evt][idx].call( _this, e );
                }
            };
            
            eval( evt + "=" + _tfunc.toString() );
        }

        _this._events[evt].push( handle );

        return this;
    }

    _init () {
    }
}

// run test in nodejs.
if ( "undefined" != typeof( module ) ) {
    module.exports = animation;
}

/*
var ani = new animation( 'canvas' );
// 设置宽高
ani.width = 800;
ani.height = 600;
// 设置缩放比例，画布中所有的内容皆按比例缩放
ani.rotateRate = 1;

// 设置事件，例如在屏幕更新宽高时设置新的缩放比例
ani.bind( "window.onresize", function() {
    ani.rotateRate = window.outerWidth / 800;
} )

// 加载资源
ani.source.add( 'background', {
    url : "[bg-url]",       // 资源
    width: 4000,            // 宽度
    height: 700,            // 高度
} );
ani.source.add( 'animation-1', {
    url : "https://[sometimenaive]/animation-1/{0}",  // 包含占位符的资源链接，用于加载多张图片
    width: 380,
    height: 40,
    count: 80,              // 动画帧数，即加载图片的数量，从零开始
    frame : 24,             // 每秒帧数
} );
ani.source.add( 'animation-2', {
    url : [ "[url1]", "[url2]" ],   // 资源链接组
    width: 380,
    height: 40,
    frame : 24,
} )

// 添加热区
ani.area.add( 'area-1', {
    width: 100,
    height: 40,
} )
*/
