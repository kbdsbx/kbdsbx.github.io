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
                callback.call( _self );
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

    pipe ( func, args ) {
        var _tmp_data = [];

        for ( let y = 0; y < this.height; y++ ) {
            for ( let x = 0; x < this.width; x++ ) {
                let vals = func( this, x, y, args );
                _tmp_data.push( vals[0] );
                _tmp_data.push( vals[1] );
                _tmp_data.push( vals[2] );
                _tmp_data.push( vals[3] );
            }
        }

        for ( let i = 0; i < _tmp_data.length; i++ ) {
            this.img_data.data[i] = Math.max( 0, Math.min( 255, Math.round(  _tmp_data[i] ) ) );
        }
        // this.img_data = new ImageData( new Uint8ClampedArray( _tmp_data ), this.width, this.height );

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