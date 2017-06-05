"use strict"

class Effect {

    static grayed( r, g, b, a ) {
        var t = Math.min( Math.ceil( r * .3 + g * .6 + b * .1 ), 255 );
        return [ t, t, t, a ];
    }

    static grayed( img, x, y ) {
        // 0.3r + 0.59g + 0.11b
        let s = img.r( x, y ) * .3 + img.g( x, y ) * .59 + img.b( x, y ) * .11;
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

        return [ g, g, g, img.a( x, y ) ];
    }

    static sobel2( img, x, y ) {
        // | -2 -1 0 |   | (x-1,y-1) (x,y-1) (x+1,y-1) |
        // | -1 0 +1 | * | (x-1,y)   (x,y)   (x+1,y)   |
        // | 0 +1 +2 |   | (x-1,y+1) (x,y+1) (x+1,y+1) |
        let gx = 
            -2 * img.r( x-1, y-1 ) + -1 * img.r( x, y-1 ) +
            -1 * img.r( x-1, y ) +  img.r( x+1, y ) + 
            img.r( x, y+1 ) + 2 * img.r( x+1, y+1 );

        // | 0 -1 -2 |   | (x-1,y-1) (x,y-1) (x+1,y-1) |
        // | +1 0 -1 | * | (x-1,y)   (x,y)   (x+1,y)   |
        // | +2 +1 0 |   | (x-1,y+1) (x,y+1) (x+1,y+1) |
        // let gy = 
        //     -1 * img.r( x, y-1 ) + -2 * img.r( x+1, y-1 ) +
        //     img.r( x-1, y ) +  img.r( x+1, y ) + 
        //     2 * img.r( x-1, y+1 ) + img.r( x, y+1 );

        let g = Math.max( 0, Math.min( 255, Math.floor( Math.abs( gx ) ) ) );

        return [ g, g, g, img.a( x, y ) ];
    }

    static gauss_blur( img, x, y, args ) {
        var range = args ? args.range : 2;
        var _r = 1 / ( range * range );
        var gauss = ( x, y ) => {
            // PI = 3.1415926
            // sigma = range
            // mu = 0
            return 0.15915494580678602 * _r * Math.exp( ( x * x + y * y ) * -.5 * _r );
        }

        var c = [ 0, 0, 0, img.a( x, y ) ];
        var gauss_sum = 0;
        for ( let fx = -range; fx < range; fx++ ) {
            for ( let fy = -range; fy < range; fy++ ) {
                var _t = gauss( fx, fy );
                gauss_sum += _t;

                var nx = x + fx, ny = y + fy;
                if ( nx < 0 ) {
                    nx = -nx;
                }
                if ( nx >= img.width ) {
                    nx = img.width - ( nx - img.width ) - 1;
                }
                if ( ny < 0 ) {
                    ny = -ny;
                }
                if ( ny >= img.height ) {
                    ny = img.height - ( ny - img.height ) - 1;
                }

                c[0] += _t * img.r( nx, ny );
                c[1] += _t * img.g( nx, ny );
                c[2] += _t * img.b( nx, ny );
            }
        }

        c[0] /= gauss_sum;
        c[1] /= gauss_sum;
        c[2] /= gauss_sum;

        return c;
    }

    static blur ( img, x, y, args ) {
        var range = args ? args.range : 4;

        var c = [ 0, 0, 0, img.a( x, y ) ];
        for ( let fx = -range; fx < range; fx++ ) {
            for ( let fy = -range; fy < range; fy++ ) {
                var nx = x + fx, ny = y + fy;
                if ( nx < 0 ) {
                    nx = -nx;
                }
                if ( nx >= img.width ) {
                    nx = img.width - ( nx - img.width ) - 1;
                }
                if ( ny < 0 ) {
                    ny = -ny;
                }
                if ( ny >= img.height ) {
                    ny = img.height - ( ny - img.height ) - 1;
                }
                c[0] += img.r( nx, ny );
                c[1] += img.g( nx, ny );
                c[2] += img.b( nx, ny );
            }
        }

        c[0] = Math.floor( c[0] / Math.pow( range * 2, 2 ) );
        c[1] = Math.floor( c[1] / Math.pow( range * 2, 2 ) );
        c[2] = Math.floor( c[2] / Math.pow( range * 2, 2 ) );

        return c;
    }

    static bools( img, x, y, args ) {
        var t = img.r( x, y ) > ( args ? args.range : 128.5 ) ? 255 : 0;
        return [ t, t, t, img.a( x, y ) ];
    }

    static layering( img, x, y ) {
        for ( let i = 0; i < 8; i++ ) {
            if ( img.r( x, y ) >= ( i * 32 ) && img.r( x, y ) < ( ( i + 1 ) * 32 ) ) {
                var t = 32 * i + 16;
                return [ t, t, t, img.a( x, y ) ];
            }
        }
    }

    static relievo( img, x, y ) {
        var cr = img.r( x,y );
        var r =
            ( cr - img.r( x-1, y-1 ) ) + ( cr - img.r( x, y-1 ) ) + ( cr - img.r( x+1, y-1 ) ) +
            ( cr - img.r( x-1, y ) ) + ( cr - img.r( x, y ) ) + ( cr - img.r( x+1, y ) ) +
            ( cr - img.r( x-1, y+1 ) ) + ( cr - img.r( x, y + 1 ) ) + ( cr - img.r( x+1, y+1 ) )
            + 128;

        var cg = img.g( x,y );
        var g =
            ( cg - img.g( x-1, y-1 ) ) + ( cg - img.g( x, y-1 ) ) + ( cg - img.g( x+1, y-1 ) ) +
            ( cg - img.g( x-1, y ) ) + ( cg - img.g( x, y ) ) + ( cg - img.g( x+1, y ) ) +
            ( cg - img.g( x-1, y+1 ) ) + ( cg - img.g( x, y + 1 ) ) + ( cg - img.g( x+1, y+1 ) )
            + 128;

        var cb = img.b( x,y );
        var b =
            ( cb - img.b( x-1, y-1 ) ) + ( cb - img.b( x, y-1 ) ) + ( cb - img.b( x+1, y-1 ) ) +
            ( cb - img.b( x-1, y ) ) + ( cb - img.b( x, y ) ) + ( cb - img.b( x+1, y ) ) +
            ( cb - img.b( x-1, y+1 ) ) + ( cb - img.b( x, y + 1 ) ) + ( cb - img.b( x+1, y+1 ) )
            + 128;

        return [ r, g, b, img.a( x, y ) ];
    }

    static oil ( img, x, y, args ) {
        const range = args ? args.range : 4;
        const group = args ? args.group : 8;

        var _groups = [];
        for ( let i = 0; i < group; i++ ) {
            _groups.push( [] );
        }

        var _t = 256 / group;

        // 范围内元素分组
        for ( let fy = -range; fy <= range; fy++ ) {
            for ( let fx = -range; fx <= range; fx++ ) {
                let gray = Effect.grayed( img, x + fx, y + fy );

                for ( let i = 0; i < group; i++ ) {
                    if ( gray[0] >= ( i * _t ) && gray[0] < ( ( i + 1 ) * _t ) ) {
                        _groups[i].push( [ x + fx, y + fy ] );
                        break;
                    }
                }
            }
        }

        // 选出数量最多的一组
        var max = 0;
        for ( let i = 1; i < group; i++ ) {
            if ( _groups[i].length > _groups[i - 1].length ) {
                max = i;
            }
        }

        // 求组中所有像素的均值
        var c = [ 0, 0, 0, 255 ];
        for ( let i = 0; i < _groups[max].length; i++ ) {
            c[0] += img.r( _groups[max][i][0], _groups[max][i][1] )
            c[1] += img.g( _groups[max][i][0], _groups[max][i][1] )
            c[2] += img.b( _groups[max][i][0], _groups[max][i][1] )
        }
        c[0] = Math.floor( c[0] / _groups[max].length );
        c[1] = Math.floor( c[1] / _groups[max].length );
        c[2] = Math.floor( c[2] / _groups[max].length );

        return c;
    }
}

define ( 'Effect', [], function() { 
    return Effect;
} );
