
class Fonts {
    constructor ( path, callback ) {
        var _self = this;
        this.path = path;

        var xhr = new XMLHttpRequest();
        var rdr = new FileReader();

        rdr.onloadend = function( val ) {
            var u16 = new Uint16Array( val.target.result );
            console.log( u16 );
        }

        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                var b = xhr.response;
                var pt = b.slice( 0, 18 );
                rdr.readAsArrayBuffer( pt );
                /*
                if ( callback ) {
                    callback.call( this, response_data );
                }
                */
            }
        }

        xhr.open( 'GET', path );
        xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
        xhr.responseType = "blob";
        xhr.send( null );
    }
}