"use strict"

class Img {
    constructor ( path, width, height, callback ) {
        let _self = this;

        this.path = path;
        this.width = width;
        this.height = height;

        this.img = new Image();
        this.img.onload = function() {
            _self.can = $( '<canvas></canvas>' )
                .attr( 'width', width + 'px' )
                .attr( 'height', height + 'px' )
                .get( 0 );

            _self.ctx = _self.can.getContext( '2d' );
            _self.ctx.drawImage( _self.img, 0, 0, width, height );

            _self.reset();

            if ( callback ) {
                callback.call( this );
            }
        };
        this.img.src = this.path;
    }

    r ( x, y, v ) {
        if ( x < 0 || x >= this.width || y < 0 || y >= this.height ) {
            return 0;
        }
        if ( v !== undefined ) {
            this.img_data.data[ ( y * this.width + x ) * 4 ] = v;
        } else {
            return this.img_data.data[ ( y * this.width + x ) * 4 ];
        }
    }
    g ( x, y, v ) {
        if ( x < 0 || x >= this.width || y < 0 || y >= this.height ) {
            return 0;
        }
        if ( v !== undefined ) {
            this.img_data.data[ ( y * this.width + x ) * 4 + 1 ] = v;
        } else {
            return this.img_data.data[ ( y * this.width + x ) * 4 + 1 ];
        }
    }
    b ( x, y, v ) {
        if ( x < 0 || x >= this.width || y < 0 || y >= this.height ) {
            return 0;
        }
        if ( v !== undefined ) {
            this.img_data.data[ ( y * this.width + x ) * 4 + 2 ] = v;
        } else {
            return this.img_data.data[ ( y * this.width + x ) * 4 + 2 ];
        }
    }
    a ( x, y, v ) {
        if ( x < 0 || x >= this.width || y < 0 || y >= this.height ) {
            return 0;
        }
        if ( v !== undefined ) {
            this.img_data.data[ ( y * this.width + x ) * 4 + 3 ] = v;
        } else {
            return this.img_data.data[ ( y * this.width + x ) * 4 + 3 ];
        }
    }

    static grayed( r, g, b, a ) {
        var t = Math.min( Math.ceil( r * .3 + g * .6 + b * .1 ), 255 );
        return [ t, t, t, a ];
    }

    static grayed( img, x, y ) {
        // 0.3r + 0.6g + 0.1b
        let s = img.r( x, y ) * .3 + img.g( x, y ) * .6 + img.b( x, y ) * .1;
        let t = Math.min( Math.ceil( s ), 255 );

        return [ t, t, t, img.a( x, y ) ];
    }

    static sobel( img, x, y ) {
        // | -1 0 +1 |   | (x-1,y-1) (x,y-1) (x+1,y-1) |
        // | -2 0 +2 | * | (x-1,y)   (x,y)   (x+1,y)   |
        // | -1 0 +1 |   | (x-1,y+1) (x,y+1) (x+1,y+1) |
        let gx = 
            -1 * img.r( x-1, y-1 ) + img.r( x+1, y-1 ) +
            -2 * img.r( x-1, y ) + 2 * img.r( x+1, y ) + 
            -1 * img.r( x-1, y+1 ) + img.r( x+1, y+1 );

        // | +1 +2 +1 |   | (x-1,y-1) (x,y-1) (x+1,y-1) |
        // | 0  0  0  | * | (x-1,y)   (x,y)   (x+1,y)   |
        // | -1 -2 -1 |   | (x-1,y+1) (x,y+1) (x+1,y+1) |
        let gy =
            img.r( x-1, y-1 ) + 2 * img.r( x, y-1 ) + img.r( x+1, y-1 ) +
            -1 * img.r( x-1, y+1 ) + -2 * img.r( x, y+1 ) + -1 * img.r( x+1, y+1 );

        let g = Math.min( 255, Math.floor( Math.abs( gx ) + Math.abs( gy ) ) );

        return [ g, g, g, 255 ];
    }

    pipe ( func ) {
        var _tmp_data = [];

        for ( let y = 0; y < this.height; y++ ) {
            for ( let x = 0; x < this.width; x++ ) {
                let vals = func( this, x, y );
                _tmp_data.push( vals[0] );
                _tmp_data.push( vals[1] );
                _tmp_data.push( vals[2] );
                _tmp_data.push( vals[3] );
            }
        }

        for ( let i = 0; i < _tmp_data.length; i++ ) {
            this.img_data.data[i] = _tmp_data[i];
        }

        return this;
    }

    reset () {
        this.img_data = this.ctx.getImageData( 0, 0, this.width, this.height );

        return this;
    }

    draw ( canvas ) {
        if ( this.ctx ) {
            var _octx = canvas.getContext( '2d' );
            _octx.putImageData( this.img_data, 0, 0 );
        }
    }
}

define ( 'Img', [], function() { 
    return Img;
} );