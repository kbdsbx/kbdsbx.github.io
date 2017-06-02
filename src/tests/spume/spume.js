    var _timesteps = 0;
    var _ = 0;
    var _start;

    var _src = "images/0030.jpg";

    var _cw = document.getElementById( 'spume-canvas' ).width;
    var _ch = document.getElementById( 'spume-canvas' ).height;
    var _ctx = document.getElementById( 'spume-canvas' ).getContext( '2d' );
    var _spume = new Image();
    var _pos = {
        left : $( '#spume-canvas' ).position().left,
        top : $( '#spume-canvas' ).position().top,
    }

    var _can = $( '<canvas></canvas>' )
        .attr( 'width', _cw + 'px' )
        .attr( 'height', _ch + 'px' )
        .get( 0 );
    var _t_ctx = _can.getContext( '2d' );

    _spume.onload = function() {
        // 将图片绘制至临时画布并调整大小
        _t_ctx.drawImage( _spume, 0, 0, _spume.width, _spume.height, 0, 0, _cw, _ch );
        consoles.log( `Images width: ${_spume.width}  height ${_spume.height}` );
    }
    _spume.src = _src;

    // _spume.onload();

    var _old_move_down = null;

    $( '#spume-canvas' )
        .on( 'touchstart mousedown', function( e ) {
            _start = e.originalEvent.touches[0];
            //$( '.note-before, .note-middle, .note-animation' ).removeClass( 'show' );

            // 获取触控区域
            var _move_down = {
                left : _start.clientX - _pos.left,
                top : _start.clientY - _pos.top,
            }

            _old_move_down = _move_down;
        } )
        .on( 'touchmove mousemove', function( e ) {
            e.preventDefault();
            var _touch = e.originalEvent.touches[0];

            // 获取触控区域
            var _move_down = {
                left : _touch.clientX - _pos.left,
                top : _touch.clientY - _pos.top,
            }

            var _alpha = function( x, y, w ) {
                return ( x * ( w + 1 ) + y ) * 4 + 3;
            }

            // 将触控区域进行羽化处理并绘制至画布
            // 羽化只需要将该区域的像素alpha值按比例减少即可
            var _px_process = function( data, w, h, old_data ) {
                var centerx = Math.floor( w / 2 ), centery = Math.floor( h / 2 );
                var maxdst = ( Math.pow( centerx, 2 ) + Math.pow( centery, 2 ) );
                var ratio = w > h ? h / w : w / h;

                for ( var y = 0; y <= h; y++ ) {
                    for ( var x = 0; x <= w; x++ ) {

                        var dx = centerx - x;
                        var dy = centery - y;

                        if ( w > h ) {
                            dx = dx * ratio;
                        } else {
                            dy = dy * ratio;
                        }

                        var dst = ( Math.pow( dx, 2 ) + Math.pow( dy, 2 ) ) / ( maxdst * .5 );

                        var stded = data[_alpha( x, y, w )];
                        var changed = data[_alpha( x, y, w )] * ( 1 - ( dst > 1 ? 1 : dst ) ) * .1;
                        var added = old_data[_alpha( x, y, w )] + changed;

                        // 在触摸移动时计算区域内的所有像素透明度以保证不超过原图透明度并持续加深羽化区域
                        data[_alpha( x, y, w )] = added > stded ? stded : added;
                    }
                }

                return data;
            }

            var _image_parse = function( src, des, left, top, width, height ) {
                var _left, _top, _width, _height;
                if ( left < 0 ) {
                    _width = width + left;
                    _left = 0;
                } else {
                    _width = width;
                    _left = left;
                }
                if ( top < 0 ) {
                    _height = height + top;
                    _top = 0;
                } else {
                    _height = height;
                    _top = top;
                }

                if ( _width <= 0 || _height <= 0 ) {
                    return;
                }

                var _oldData = des.getImageData( _left, _top, _width, _height );
                var _imgData = src.getImageData( _left, _top, _width, _height );
                _px_process( _imgData.data, _width, _height, _oldData.data );
                des.putImageData( _imgData, _left, _top );
            }

            if ( _old_move_down ) {
                // 斜边总长
                var _l = Math.sqrt( Math.pow( _move_down.left - _old_move_down.left, 2 ) + Math.pow(  _move_down.top - _old_move_down.top, 2 ) );
                // 步数
                var _s = Math.floor( _l / 10 );
                var _xs = ( _move_down.left - _old_move_down.left ) / _s;
                var _ys = ( _move_down.top - _old_move_down.top ) / _s;

                // 两次touchmove事件之间的距离使用步长为10px的离散触摸区域补充以保证图像连续
                for ( var i = 1; i <= _s; i++ ) {
                    var _step_move_down = {
                        left : _old_move_down.left + _xs * i,
                        top : _old_move_down.top + _ys * i,
                    }

                    /*
                    if ( _step_move_down.left < 20 || _step_move_down.top < 20 ) {
                        continue;
                    }
                    */

                    /*
                    var _oldimgData = _ctx.getImageData( _step_move_down.left - 20, _step_move_down.top - 20, 40, 40 );
                    var _imgData = _t_ctx.getImageData( _step_move_down.left - 20, _step_move_down.top - 20, 40, 40 );
                    // 羽化触控区域边缘
                    // _px_process( _imgData.data, 40, 40, _oldimgData.data );
                    consoles.log ( `${_step_move_down.left - 20}   ${_step_move_down.top}` );
                    _ctx.putImageData( _imgData, _step_move_down.left - 20, _step_move_down.top - 20 );
                    */
                    _image_parse( _t_ctx, _ctx, _step_move_down.left - 20, _step_move_down.top - 20, 40, 40 );
                }
            }

            if ( _ ) {
                return;
            }
            _ = setTimeout( function() {
                _ = 0;

                _timesteps++;
            }, 100 );

            _old_move_down = _move_down;
        } )
        .on( 'touchend mouseup', function( e ) {
            _old_touch = null;

            /*
            if ( _timesteps < 40 ) {
                $( '.note-middle' ).addClass( 'show' );
                $( '.note-animation' ).addClass( 'show' );
            } else {
                 
                $( '.btn' ).each( function() {
                    this.interval();
                    this.__stop = false;
                } );

                $( '.second-page' ).removeClass( 'show' );
                $( '.third-page' ).addClass( 'show' );
            }
            */
        } )