
class stream {
    constructor ( buffer ) {
        this.__buffer = buffer;
        this.__pointer = 0;     // byte
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

    getInt16() {
        var _t = this.__reader.getInt16( this.___pointer, false );
        this.__pointer += 2;
        return _t;
    }

    getFixed32() {
        var _t = this.__reader.getUint32( this.__pointer, false );
        _t = ( _t >> 16 ) + ( _t & 0xFFFF ) / 0x10000;
        this.__pointer += 4;
        return _t;
    }

    getUint8Array( length ) {
        var _t = new Uint8Array( this.__buffer, this.__pointer, length );
        this.__pointer += length;
        return _t;
    }

    getUint16Array( length ) {
        var _t = new Uint16Array( length );
        for ( let i = 0; i < length; i++, this.__pointer += 2 ) {
            _t[i] = this.__reader.getUint16( this.__pointer, false );
        }
        return _t;
    }

    getInt16Array( length ) {
        var _t = new Int16Array( length );
        for ( let i = 0; i < length; i++, this.__pointer += 2 ) {
            _t[i] = this.__reader.getInt16( this.___pointer, false );
        }
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

    getUint16ArrayToEnd () {
        var _last = ( this.__buffer.byteLength - this.__pointer ) >> 1;
        var _t = new Uint16Array( _last );
        for ( let i = 0; i < _last; i++, this.__pointer += 2 ) {
            _t[i] = this.__reader.getUint16( this.__pointer, false );
        }
        return _t;
    }

    slice ( begin, end ) {
        var _buff = this.__buffer.slice( begin, end );
        return new stream( _buff );
    }
}

class sfnt {
    constructor ( stm ) {
        this.stream = stm;
        this.parser();
    }
}

class cmap extends sfnt {
    // pointer has been set.
    _sequentialMap ( length ) {
        var _vals = [];

        for ( let i = 0; i < length; i++ ) {
            var _t = {};
            _t.startCharCode = this.stream.getUint32();
            _t.endCharCode = this.stream.getUint32();
            _t.startGlyphID = this.stream.getUint32();

            _vals.push( _t );
        }

        return _vals;
    }

    // pointer has been set.
    _constantMap ( length ) {
        var _vals = [];

        for ( let i = 0; i < length; i++ ) {
            var _t = {};
            _t.startCharCode = this.stream.getUint32();
            _t.endCharCode = this.stream.getUint32();
            _t.glyphID = this.stream.getUint32();

            _vals.push( _t );
        }

        return _vals;
    }

    parser () {
        var _self = this;

        this.version = this.stream.getUint16();
        this.numberSubtables = this.stream.getUint16();

        this.encodingTables = [];

        for ( let i = 0; i < this.numberSubtables; i++ ) {
            var _enc = {};
            _enc.platformID = this.stream.getUint16();
            _enc.platformSpecificID = this.stream.getUint16();
            _enc.offset = this.stream.getUint32();

            this.encodingTables.push( _enc );
        }

        this.formats = [];

        for ( let i = 0; i < this.numberSubtables; i++ ) {
            let _format = {};
            this.stream.__pointer = this.encodingTables[i].offset;

            _format.format = this.stream.getUint16();

            let _switch = {
                0 : function() {
                    _format.length = _self.stream.getUint16();
                    _format.language = _self.stream.getUint16();

                    _format.glyphIndexArray = _self.stream.getUint8Array( 256 );
                },
                // TODO:
                2 : function() {
                    _format.length = _self.stream.getUint16();
                    _format.language = _self.stream.getUint16();
                    // _format.subHeaderKeys = this.stream.getUint8Array( 256 );
                },
                4 : function() {
                    _format.length = _self.stream.getUint16();
                    _format.language = _self.stream.getUint16();

                    _format.segCountx2 = _self.stream.getUint16();

                    var _segCount = _format.segCountx2 >> 1;

                    _format.searchRange = _self.stream.getUint16();
                    _format.entrySelector = _self.stream.getUint16();
                    _format.rangeShift = _self.stream.getUint16();
                    _format.endCount = _self.stream.getUint16Array( _segCount );
                    _format.reservedPad = _self.stream.getUint16();
                    _format.startCount = _self.stream.getUint16Array( _segCount );
                    _format.idDelta = _self.stream.getInt16Array( _segCount );
                    _format.idRangeOffset = _self.stream.getUint16Array( _segCount );

                    _format.glyphIndexArray = _self.stream.getUint16Array( ( _format.length - ( 16 + ( _segCount << 3 ) ) ) >> 1 );
                },
                6 : function() {
                    _format.length = _self.stream.getUint16();
                    _format.language = _self.stream.getUint16();

                    _format.firstCode = _self.stream.getUint16();
                    _format.entryCode = _self.stream.getUint16();

                    _format.glyphIndexArray = _self.stream.getUint16Array( _format.entryCode );
                },
                8 : function() {
                    _format.reserved = _self.stream.getUint16();
                    _format.length = _self.stream.getUint32();
                    _format.language = _self.stream.getUint32();

                    _format.is32 = _self.stream.getUint8Array( 8192 );
                    _format.numGroups = _self.stream.getUint32();

                    _format.SequentialMapGroup = _self._sequentialMap( _format.numGroups );
                },
                10 : function() {
                    _format.reserved = _self.stream.getUint16();
                    _format.length = _self.stream.getUint32();
                    _format.language = _self.stream.getUint32();

                    _format.startCharCode = _self.stream.getUint32();
                    _format.numGroups = _self.stream.getUint32();
                    _format.glyphIndexArray = _self.stream.getUint16Array( ( _format.length - 18 ) >> 1 );
                },
                12 : function() {
                    _format.reserved = _self.stream.getUint16();
                    _format.length = _self.stream.getUint32();
                    _format.language = _self.stream.getUint32();
                    _format.numGroups = _self.stream.getUint32();

                    _format.SequentialMapGroup = _self._sequentialMap( _format.numGroups );
                },
                13 : function() {
                    _format.reserved = _self.stream.getUint16();
                    _format.length = _self.stream.getUint32();
                    _format.language = _self.stream.getUint32();
                    _format.numGroups = _self.stream.getUint32();

                    _format.ConstantMapGroup = _self._constantMap( _format.numGroups );
                },
                // TODO:
                14 : function() {},
            };

            _switch[ _format.format ]();

            this.formats.push( _format );
        }

        console.log( this );
    }
}

class head extends sfnt {
    parser () {
        var _self = this;

        this.majorVersion = this.stream.getUint16();
        this.minorVersion = this.stream.getUint16();

        this.fontRevison = this.stream.getFixed32();

        console.log( this );
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
        return [
            // required tables
            "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post",
            // TureType outlines
            "cvt ", "fpgm", "glyf", "loca", "prep", "gasp",
            // PostScript outlines
            "CFF ", "CFF2", "VORG",
            // SVG outlines
            "SVG ",
            // Bitmap glyps
            "EBDT", "EBLC", "EBSC", "CBDT", "CBLC", "sbix",
            // typographic tables
            "BASE", "GDEF", "GPOS", "GSUB", "JSTF", "MATH",
            // OpenType variations
            "avar", "cvar", "fvar", "gvar", "HVAR", "MVAR", "VVAR",
            // color fonts
            "COLR", "CPAL", "CBDT", "CBLC", "sbix", "SVG ",
            // OpenType tables
            "DSIG", "hdmx", "kern", "LTSH", "MERG", "meta", "STAT", "PCLT", "VDMX", "vhea", "vmtx"
        ];
        // return [ "acnt", "ankr", "avar", "bdat", "bhed", "bloc", "bsln", "cmap", "cvar", "cvt ", "EBSC", "fdsc", "feat", "fmtx", "fond", "fpgm", "fvar", "gasp", "gcid", "glyf", "gvar", "hdmx", "head", "hhea", "hmtx", "just", "kern", "herx", "lcar", "loca", "ltag", "maxp", "meta", "mort", "morx", "name", "opbd", "OS/2", "post", "prep", "prop", "sbix", "trak", "vhea", "vmtx", "xref", "Zapf" ];
    }

    _get_sfnt ( meta ) {
        var start = this.meta[ meta ].offset;
        var long = this.meta[ meta ].length;

        return this.stream.slice( start, start + long );
    }

    _parser_cmap () {
        var cmap_stream = this._get_sfnt( "cmap" );
        this.cmap = new cmap( cmap_stream );

        var head_stream = this._get_sfnt( "head" );
        this.head = new head( head_stream );
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