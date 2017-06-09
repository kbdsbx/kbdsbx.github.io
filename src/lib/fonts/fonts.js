
class stream {
    constructor ( buffer ) {
        this.__buffer = buffer;
        this.__pointer = 0;
        this.__reader = new DataView( this.__buffer );
    }

    getUint32 () {
        var _t = this.__reader.getUint32( this.__pointer, false );
        this.__pointer += 4;
        return _t;
    }

    getUint16 () {
        var _t = this.__reader.getUint16( this.__pointer, false );
        this.__pointer += 2;
        return _t;
    }

    getUint8Array( length ) {
        var _t = new Uint8Array( this.__buffer, this.__pointer, length );
        this.__pointer += length;
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

    slice ( begin, end ) {
        var _buff = this.__buffer.slice( begin, end );
        return new stream( _buff );
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
                var buff = rdr.readAsArrayBuffer( xhr.response );
                _self.stream = new stream( buff );

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

        return this.stream.slice( start, start + long );
    }

    _parser_cmap () {
        var cmap_stream = this._get_sfnt( "cmap" );

        this.cmap = {};

        this.cmap.version = cmap_stream.getUint16();
        this.cmap.numberSubtables = cmap_stream.getUint16();

        this.cmap.encodingTables = [];

        for ( let i = 0; i < this.cmap.numberSubtables; i++ ) {
            var _enc = {};
            _enc.platformID = cmap_stream.getUint16();
            _enc.platformSpecificID = cmap_stream.getUint16();
            _enc.offset = cmap_stream.getUint32();

            this.cmap.encodingTables.push( _enc );
        }

        for ( let i = 0; i < this.cmap.numberSubtables; i++ ) {
            var _formats = {};
            cmap_stream.__pointer = this.cmap.encodingTables[i].offset;

            _formats.format = cmap_stream.getUint16();

            console.log( _formats.format );
        }

/*
        var _t = {};
        _t.format = this.stream.getUint16();
        _t.length = this.stream.getUint16();
        _t.language = this.stream.getUint16();
        _t.glyphIndexArray = this.stream.getUint8Array( _t.length - 6 );

        this.cmap.subTables.push( _t );
        */

        console.log( this.cmap );
    }

    parser () {
        this._offset_subtable.scaler_type = this.stream.getUint32();
        this._offset_subtable.numTables = this.stream.getUint16();
        this._offset_subtable.searchRange = this.stream.getUint16();
        this._offset_subtable.entrySelector = this.stream.getUint16();
        this._offset_subtable.rangeShift = this.stream.getUint16();

        console.log( this._offset_subtable );

        this.meta = {};

        var _label;
        var _label_list = Fonts.table_name();

        do {
            _label = this.stream.getChar4();
            if ( -1 !== _label_list.indexOf( _label ) ) {
                var checkSum = this.stream.getUint32(),
                    offset = this.stream.getUint32(),
                    length = this.stream.getUint32();

                this.meta[ _label ] = {
                    tag : _label,
                    checkSum : checkSum,
                    offset : offset,
                    length : length,
                }
            } else {
                this.stream.putUint32();
                break;
            }
        } while ( 1 );

        console.log( this.meta )

        if ( this.meta[ "cmap" ] ) {
            this._parser_cmap();
        }
    }
}