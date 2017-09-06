
class animation_context {
    constructor ( animation ) {
        this._ani = animation;
        this._line_len = 3;     // 小于[line_len]个像素的曲线被绘制成直线
    }
    
    beginPath () {
        this.__x = 0;
        this.__y = 0;
        this.__path = [];
        this.__full = 0;
        this.__ms_pass = 0;
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
        let sec = Math.sqrt( Math.pow( x - this.__x, 2 ) + Math.pow( y - this.__y, 2 ) );
        let count = Math.ceil( sec / this._line_len );
        let step_x = ( x - this.__x ) * 1.0 / count;
        let step_y = ( y - this.__y ) * 1.0 / count;

        for ( let i = 1; i < count; i++ ) {
            this.__path.push( {
                to_x : this.__x + step_x,
                to_y : this.__y + step_y,
                length : this._line_len,
            } );

            this.__x += step_x;
            this.__y += step_y;
        }

        this.__full += sec;
    }

    quadraticCurveTo( cpx, cpy, x, y ) {
        let max_len = Math.sqrt( Math.pow( cpx - this.__x, 2 ) + Math.pow( cpy - this.__y, 2 ) ) + Math.sqrt( Math.pow( x - cpx, 2 ) + Math.pow( y - cpy, 2 ) );
        let len = Math.floor( 1.0 * max_len / this._line_len );

        let _start_x = this.__x;
        let _start_y = this.__y;

        for ( let i = 0; i < len; i++ ) {
            let t = 1.0 / len * i;
            let a = ( 1 - t ) * ( 1 - t );
            let b = 2.0 * t * ( 1 - t );
            let c = t * t;

            let to_x = a * _start_x + b * cpx + c * x;
            let to_y = a * _start_y + b * cpy + c * y;

            let sec = Math.sqrt( Math.pow( to_x - this.__x, 2 ) + Math.pow( to_y - this.__y, 2 ) );
            this.__path.push( {
                to_x : to_x,
                to_y : to_y,
                length : sec,
            } );
            this.__full += sec;

            this.__x = to_x;
            this.__y = to_y;
        }

        let sec = Math.sqrt( Math.pow( x - this.__x, 2 ) + Math.pow( y - this.__y, 2 ) );
        this.__path.push( {
            to_x : x,
            to_y : y,
            length : sec,
        } );
        this.__full += sec;

        this.__x = x;
        this.__y = y;
    }

    stroke( ms ) {
        var ctx = this._ani.$context;

        if ( ! ms ) {
            ctx.beginPath();
            ctx.moveTo( this.__path[0].to_x, this.__path[0].to_y );
            for ( let i = 1; i < this.__path.length; i++ ) {
                if ( this.__path[i].length ) {
                    ctx.lineTo( this.__path[i].to_x, this.__path[i].to_y );
                } else {
                    ctx.moveTo( this.__path[i].to_x, this.__path[i].to_y );
                }
            }
            ctx.stroke();
        } else {
            this.__ms_pass += this._ani._pass;

            var _len_per_ms = this.__full / ms;
            var _len = this.__full / ms * this.__ms_pass;

            ctx.beginPath();
            ctx.moveTo( this.__path[0].to_x, this.__path[0].to_y );

            for ( let drawed = 0, i = 0; drawed <= _len; i++ ) {
                if ( i >= this.__path.length ) {
                    break;
                }
                
                if ( this.__path[i].length ) {
                    ctx.lineTo( this.__path[i].to_x, this.__path[i].to_y );
                } else {
                    ctx.moveTo( this.__path[i].to_x, this.__path[i].to_y );
                }

                drawed += this.__path[i].length;
            }

            /*
            for ( let drawed = 0 ; drawed <= _len ; this.__pointer++ ) {
                if ( this.__pointer >= this.__path.length ) {
                    return;
                }
                if ( this.__path[this.__pointer].length ) {
                    ctx.lineTo( this.__path[this.__pointer].to_x, this.__path[this.__pointer].to_y );
                } else {
                    ctx.moveTo( this.__path[this.__pointer].to_x, this.__path[this.__pointer].to_y );
                }
                drawed += this.__path[this.__pointer].length;
            }
            */
            ctx.stroke();
        }
    }
}