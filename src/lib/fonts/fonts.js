
class stream {
    constructor ( buffer ) {
        this.__buffer = buffer;
        this.__painter = 0;
    }

    getUint32 () {
        var _t = new DataView( this.__buffer ).getUint32( this.__pointer, false );
        this.__pointer +=4;
        return _t;
    }

    getUint16 () {
        var _t = new DataView( this.__buffer ).getUint16( this.__pointer, false );
        this.__pointer += 4;
        return _t;
    }

    putUint32 () {
        this.__pointer -= 4;
    }

    putUint16 () {
        this.__pointer -= 2;
    }

    getChar4() {
        var _t = this.getUint32();
        var _r = "" +
            String.fromCharCode( _t >> 24 & 0xFF ) +
            String.fromCharCode( _t >> 16 & 0xFF ) +
            String.fromCharCode( _t >> 8 & 0xFF ) +
            String.fromCharCode( _t >> 0 & 0xFF );

        return _r;
    }
}

class Fonts {
    constructor ( path, callback ) {
        var _self = this;
        this.__pointer = 0;
        this._offset_subtable = {
            scaler_type : 0,
            numTables : 0,
            searchRange : 0,
            entrySelector : 0,
            rangeShift : 0
        }

        this.path = path;
        this.rdr = new FileReaderSync();

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                var rdr = new FileReaderSync();
                var blob = rdr.readAsArrayBuffer( xhr.response );
                _self.stream = new stream( blob );
                // _self.data = xhr.response;
                _self.parser();
            }
        }

        xhr.open( 'GET', path );
        xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
        xhr.responseType = "blob";
        xhr.send( null );
    }

    static table_name () {
        return [ "acnt", "ankr", "avar", "bdat", "bhed", "bloc", "bsln", "cmap", "cvar", "cvt ", "EBSC", "fdsc", "feat", "fmtx", "fond", "fpgm", "fvar", "gasp", "gcid", "glyf", "gvar", "hdmx", "head", "hhea", "hmtx", "just", "kern", "herx", "lcar", "loca", "ltag", "maxp", "meta", "mort", "morx", "name", "opbd", "OS/2", "post", "prep", "prop", "sbix", "trak", "vhea", "vmtx", "xref", "Zapf" ];
    }

    _get_sfnt ( meta ) {
        var start = this.meta[ meta ].offset;
        var long = this.meta[ meta ].length;

        return this.data.slice( start, start + long );
    }

    _get_uint_32 () {
        var _b = this.data.slice( this.__pointer, this.__pointer + 4 );
        this.__pointer += 4;

        var _uint32 = this.rdr.readAsArrayBuffer( _b );
        return new DataView( _uint32 ).getUint32( 0, false );
    }

    _get_uint_16 () {
        var _b = this.data.slice( this.__pointer, this.__pointer + 2 );
        this.__pointer += 2;

        var _uint16 = this.rdr.readAsArrayBuffer( _b );
        return new DataView( _uint16 ).getUint16( 0, false );
    }

    _put_uint_32 () {
        this.__pointer -= 4;
    }

    _put_uint_16 () {
        this.__pointer -= 2;
    }

    _turn_string( val ) {
        var _r = "" +
            String.fromCharCode( val >> 24 & 0xFF ) +
            String.fromCharCode( val >> 16 & 0xFF ) +
            String.fromCharCode( val >> 8 & 0xFF ) +
            String.fromCharCode( val >> 0 & 0xFF );

        return _r;
    }

    _parser_cmap () {
        var b = this._get_sfnt( "cmap" );
    }

    parser () {
        this._offset_subtable.scaler_type = this._get_uint_32();
        this._offset_subtable.numTables = this._get_uint_16();
        this._offset_subtable.searchRange = this._get_uint_16();
        this._offset_subtable.entrySelector = this._get_uint_16();
        this._offset_subtable.rangeShift = this._get_uint_16();

        this.meta = {};

        var _label;
        var _label_list = Fonts.table_name();
        do {
            _label = this._turn_string( this._get_uint_32() );
            if ( -1 !== _label_list.indexOf( _label ) ) {
                var checkSum = this._get_uint_32(),
                    offset = this._get_uint_32(),
                    length = this._get_uint_32();

                this.meta[ _label ] = {
                    tag : _label,
                    checkSum : checkSum,
                    offset : offset,
                    length : length,
                }
            } else {
                this._put_uint_32();
                break;
            }
        } while ( 1 );

        console.log( this.meta )

        if ( this.meta[ "cmap" ] ) {
            this._parser_cmap();
        }
    }
}