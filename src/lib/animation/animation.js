
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
        this._pass = 0;
        this._prev_timestamp = 0;
        this._fps = 60;
        this._fid = 0;

        this._animation_frame = function() {
            if ( window ) {
                window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

                var _request_func = function( timestamp ) {
                    _this._pass += ( timestamp - _this._prev_timestamp );
                    if ( ( _this._pass - _this._frame ) > -1 ) {
                        _this._loop.call( _this, {
                            timestamp : timestamp,
                            pass : _this._pass,
                            context : _this.$context,
                        } );
                        _this._fps = 1000.0 / _this._pass;
                        _this._pass = 0;
                    }
                    _this._prev_timestamp = timestamp;

                    if ( _this._fid ) {
                        _this._fid = window.requestAnimationFrame( _request_func );
                    }
                }

                _this._fid = window.requestAnimationFrame( _request_func );
            } else {
                _this._fid = setInterval( function() {
                    var _now = Date.now().valueOf();
                    _this._pass = _now - _this._prev_timestamp;
                    func.call( _this, {
                        timestamp : _now,
                        pass : _this._pass,
                        context : _this.$context,
                    } );
                    _this._fps = 1000.0 / _this._pass;
                    _this._prev_timestamp = _now;
                }, this._frame );
            }
        };
        this._cancel_frame = function() {
            if ( window ) {
                window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
                
                window.cancelAnimationFrame( _this.fid );
                _this._fid = 0;
            } else {
                clearInterval( _this.fid );
            }
        }
        this._loop = function() { };
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

    get fps() {
        return this._fps;
    }

    beginPath () {
        this.__x = 0;
        this.__y = 0;
        this.__path = [];
    }

    moveTo( x, y ) {
        this.__path.push( {
            to_x : x,
            to_y : y,
            length : 0,
        } );

        this.__x = x;
        this.__y = y;
    }

    lineTo( x, y ) {
        this.__path.push( {
            to_x : x,
            to_y : y,
            length : Math.sqrt( Math.pow( x - this.__x, 2 ) + Math.pow( y - this.__y, 2 ) ),
        } );

        this.__x = x;
        this.__y = y;
    }

    quadraticCurveTo( cpx, cpy, x, y ) {
        let max_len = Math.sqrt( Math.pow( cpx - this.__x, 2 ) + Math.pow( cpy - this.__y, 2 ) ) + Math.sqrt( Math.pow( x - cpx, 2 ) + Math.pow( y - cpy, 2 ) );
        let line_len = 3;   // 小于[line_len]个像素的曲线被绘制成直线
        let len = Math.floor( 1.0 * max_len / line_len );

        for ( let i = 0; i < len; i++ ) {
            let t = 1.0 / len * i;
            let a = ( 1 - t ) * ( 1 - t );
            let b = 2.0 * t * ( 1 - t );
            let c = t * t;

            let to_x = a * this.__x + b * cpx + c * x;
            let to_y = a * this.__y + b * cpy + c * y;

            this.__path.push( {
                to_x : to_x,
                to_y : to_y,
                length : Math.sqrt( Math.pow( to_x - this.__x, 2 ) + Math.pow( to_y - this.__y, 2 ) ),
            } );

            this.__x = to_x;
            this.__y = to_y;
        }

        this.__path.push( {
            to_x : x,
            to_y : y,
            length : Math.sqrt( Math.pow( x - this.__x, 2 ) + Math.pow( y - this.__y, 2 ) ),
        } );

        this.__x = x;
        this.__y = y;
    }

    stroke( ms ) {
        var ctx = this.$context;

        ctx.beginPath();
        ctx.moveTo( this.__path[0].to_x, this.__path[0].to_y );
        for ( let i = 1; i < this.__path.length; i++ ) {
            if ( this.__path[i].length ) {
                ctx.lineTo( this.__path[i].to_x, this.__path[i].to_y );
            } else {
                ctx.moveTo( this.__path[i].to_x, this.__path[i].to_y );
            }
        }
        ctx.lineTo( this.__path[0].to_x, this.__path[0].to_y );
        ctx.stroke();
    }

    run() {
        this._animation_frame();

        this.trigger( 'run' );

        return this;
    }

    stop() {
        this._cancel_frame();

        this.trigger( 'stop' );

        return this;
    }

    on ( evt, handle ) {
        let _this = this;

        if ( ! _this._events[evt] ) {
            _this._events[evt] = [];
        }

        _this._events[evt].push( handle );

        return this;
    }

    trigger ( evt ) {
        let _this = this;
        if ( _this._events[evt] ) {
            for ( let i = 0; i < _this._events[evt].length; i++ ) {
                _this._events[evt][i].call( _this, Array.prototype.slice.call( arguments, 1 ) );
            }
        }
        return this;
    }

    off ( evt ) {
        let _this = this;

        if ( _this._events[evt] ) {
            delete _this._events[evt];
        }
        return this;
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
