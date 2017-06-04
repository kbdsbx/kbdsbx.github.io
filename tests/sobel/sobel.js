"use strict"

class Img {
    constructor ( path, width, height ) {
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

            if ( _self.call_draw ) {
                _self.draw( _self.call_draw );
                _self.call_draw = null;
            }
        };
        this.img.src = this.path;
    }

    reset () {
        this.img_data = this.ctx.getImageData( 0, 0, this.width, this.height );
    }

    draw ( canvas ) {
        if ( this.ctx ) {
            var _octx = canvas.getContext( '2d' );
            _octx.putImageData( this.img_data, 0, 0 );
        } else {
            this.call_draw = canvas;
        }
    }
}

define ( 'Img', [], function() { 
    return Img;
} );