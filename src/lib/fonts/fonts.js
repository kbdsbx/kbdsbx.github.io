
class stream {
    constructor ( buffer ) {
        this.__buffer = buffer;
        this.__pointer = 0;     // byte
        this.__reader = new DataView( this.__buffer );
    }

    // TODO: warning
    getUint64 () {
        var _t = new Uint8Array( this.__buffer, this.__pointer, 8 );
        this.__pointer += 8;
        return ( _t[0] << 56 ) + ( _t[1] << 48 ) + ( _t[2] << 40 ) + ( _t[3] << 32 ) + ( _t[4] << 24 ) + ( _t[5] << 16 ) + ( _t[6] << 8 ) + _t[7];
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
        var _t = this.__reader.getInt16( this.__pointer, false );
        this.__pointer += 2;
        return _t;
    }

    getUint8() {
        var _t = this.__reader.getUint8( this.__pointer );
        this.__pointer++;
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

    get isEnd () {
        return this.__pointer >= this.__buffer.byteLength;
    }

    set pointer ( val ) {
        this.__pointer = val;
    }

    slice ( begin, end ) {
        var _buff = this.__buffer.slice( begin, end );
        return new stream( _buff );
    }
}

class sfnt {
    constructor ( stm, params ) {
        this.stream = stm;
        this.parser( params );
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

    glyphID( code ) {
        var _this = this;
        let _switch = {
            0 : function( code ) {
            },
            4 : function ( code ) {
                var startCode = _this.curr_format.startCode;
                var endCode = _this.curr_format.endCode;
                var idRangeOffset = _this.curr_format.idRangeOffset;
                var idDelta = _this.curr_format.idDelta;
                var glyphIndexArray = _this.curr_format.glyphIndexArray;
                var idx = 0;
                for ( ; idx < endCode.length; idx++ ) {
                    if ( endCode[idx] >= code ) {
                        break;
                    }
                }
                if ( idx > idRangeOffset.length ) {
                    // do not find.
                    return -1;
                }
                if ( 0 !== idRangeOffset[idx] ) {
                    return glyphIndexArray[ idRangeOffset[idx] / 2 + ( code - startCode[idx] ) - ( idRangeOffset.length - idx ) ];
                } else {
                    return glyphIndexArray[ idDelta[idx] + code ];
                }
            }
        }

        if ( 0 !== this.curr_format ) {
            return _switch[this.curr_format.format]( code );
        } else {
            return false;
        }
    }

    parser ( argv ) {
        var _self = this;

        var _curr_platform_id = argv.platform_id;
        var _curr_encoding_id = argv.encoding_id;

        this.version = this.stream.getUint16();
        this.numberSubtables = this.stream.getUint16();

        this.encodingTables = [];

        for ( let i = 0; i < this.numberSubtables; i++ ) {
            var _enc = {};
            _enc.platformID = this.stream.getUint16();
            _enc.encodingID = this.stream.getUint16();
            _enc.offset = this.stream.getUint32();

            this.encodingTables.push( _enc );
        }

        this.formats = [];
        this.curr_format = 0;

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
                    _format.endCode = _self.stream.getUint16Array( _segCount );
                    _format.reservedPad = _self.stream.getUint16();
                    _format.startCode = _self.stream.getUint16Array( _segCount );
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

            if ( _curr_platform_id == this.encodingTables[i].platformID && _curr_encoding_id == this.encodingTables[i].encodingID ) {
                this.curr_format = _format;
            }

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

        this.checkSumAdjustment = this.stream.getUint32();
        this.magicNumber = this.stream.getUint32();
        this.flags = this.stream.getUint16();
        this.unitsPerEm = this.stream.getUint16();
        this.created = this.stream.getUint64();
        this.modified = this.stream.getUint64();

        this.xMin = this.stream.getInt16();
        this.yMin = this.stream.getInt16();
        this.xMax = this.stream.getInt16();
        this.yMax = this.stream.getInt16();

        this.macStyle = this.stream.getUint16();
        this.lowestRecPPEM = this.stream.getUint16();
        this.fontDirectionHint = this.stream.getInt16();
        this.indexToLocFormat = this.stream.getInt16();
        this.glyphDataFormat = this.stream.getInt16();

        console.log( this );
    }

    get is_bold () {
        return this.macStyle & 0B1;
    }

    get is_italic() {
        return this.macStyle & 0B10;
    }

    get is_underline () {
        return this.macStyle & 0B100;
    }

    get is_outline () {
        return this.macStyle & 0B1000;
    }

    get is_shadow () {
        return this.macStyle & 0B10000;
    }

    get is_condensed () {
        return this.macStyle & 0B100000;
    }

    get is_exteded () {
        return this.macStyle & 0B1000000;
    }
}

class maxp extends sfnt {
    parser () {
        this.version = this.stream.getFixed32();
        if ( this.version === 0.5 ) {
            this.numGlyphs = this.stream.getUint16();
        }
        if ( this.version === 1.0 ) {
            this.numGlyphs = this.stream.getUint16();
            this.maxPoints = this.stream.getUint16();
            this.maxContours = this.stream.getUint16();
            this.maxCompositePoints = this.stream.getUint16();
            this.maxCompositeContours = this.stream.getUint16();
            this.maxZones = this.stream.getUint16();
            this.maxTwilightPoints = this.stream.getUint16();
            this.maxStorage = this.stream.getUint16();
            this.maxFunctionDefs = this.stream.getUint16();
            this.maxInstructionDefs = this.stream.getUint16();
            this.maxStackElements = this.stream.getUint16();
            this.maxSizeOfInstructions = this.stream.getUint16();
            this.maxComponentElements = this.stream.getUint16();
            this.maxComponentDepth = this.stream.getUint16();
        }

        console.log( this );
    }
}

class loca extends sfnt {
    parser ( args ) {
        this.offsets = [];
        let i = args.numGlyphs + 1;
        if ( ! args.indexToLocFormat ) {
            while( i-- ) {
                this.offsets.push( this.stream.getUint16() );
            }
        } else {
            while( i-- ) {
                this.offsets.push( this.stream.getUint32() );
            }
        }

        console.log( this );
    }
}

class glyf extends sfnt {
    parser( args ) {
        this.glyphs = [];

        for ( let _idx = 0; _idx < ( args.offsets.length - 1 ); _idx++ ) {
            this.stream.pointer = args.offsets[_idx];

            var _t = {};
            _t.numberOfContours = this.stream.getInt16();
            _t.xMin = this.stream.getInt16();
            _t.yMin = this.stream.getInt16();
            _t.xMax = this.stream.getInt16();
            _t.yMax = this.stream.getInt16();

            if ( _t.numberOfContours > 0 ) {
                _t.endPtsOfContours = this.stream.getUint16Array( _t.numberOfContours );
                _t.instructionLength = this.stream.getUint16();
                _t.instructions = this.stream.getUint8Array( _t.instructionLength );

                var _length = _t.endPtsOfContours[ _t.endPtsOfContours.length - 1 ] + 1;
                _t.flags = [];

                while ( _t.flags.length < _length ) {
                    var _f = this.stream.getUint8();
                    _t.flags.push( _f );
                    if ( _f & 0B1000 ) {
                        var _rl = this.stream.getUint8();
                        while( _rl-- ) {
                            _t.flags.push( _f );
                        }
                    }
                }

                _t.xCoordinates = [];
                _t.yCoordinates = [];
                _t.xAbsolutes = [];
                _t.yAbsolutes = [];
                for ( let i = 0; i < _length; i++ ) {
                    if ( _t.flags[i] & 0B10 ) {
                        var _offset = this.stream.getUint8() * ( ( _t.flags[i] & 0B10000 ) ? 1 : -1 );
                        _t.xCoordinates.push( _offset );
                        _t.xAbsolutes.push( i ? _offset + _t.xAbsolutes[ i - 1 ] : _offset );
                    } else {
                        if ( _t.flags[i] & 0B10000 ) {
                            _t.xCoordinates.push( 0 );
                            _t.xAbsolutes.push( i ? _t.xAbsolutes[ i - 1 ] : 0 );
                        } else {
                            var _offset = this.stream.getInt16();
                            _t.xCoordinates.push( _offset );
                            _t.xAbsolutes.push( i ? _offset + _t.xAbsolutes[ i - 1 ] : _offset );
                        }
                    }
                }
                for ( let i = 0; i < _length; i++ ) {
                    if ( _t.flags[i] & 0B100 ) {
                        var _offset = this.stream.getUint8() * ( ( _t.flags[i] & 0B100000 ) ? 1 : -1 );
                        _t.yCoordinates.push( _offset );
                        _t.yAbsolutes.push( i ? _offset + _t.yAbsolutes[ i - 1 ] : _offset );
                    } else {
                        if ( _t.flags[i] & 0B100000 ) {
                            _t.yCoordinates.push( 0 );
                            _t.yAbsolutes.push( i ? _t.yAbsolutes[ i - 1 ] : 0 );
                        } else {
                            var _offset = this.stream.getInt16();
                            _t.yCoordinates.push( _offset );
                            _t.yAbsolutes.push( i ? _offset + _t.yAbsolutes[ i - 1 ] : _offset );
                        }
                    }
                }
            }

            this.glyphs.push( _t );
        }

        console.log( this );
    }

    glyph ( glyphID ) {
        return this.glyphs[glyphID];
    }
}

class Fonts {
    constructor ( path, params, callback ) {
        var _self = this;

        this.params = params;
        this.params.platform_id = Fonts.get_platform_id( params.platform );
        this.params.encoding_id = Fonts.get_encoding_id( params.encoding );

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

                if ( callback ) {
                    callback.call( this, {} );
                }
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

    static get_platform_id ( name ) {
        switch( name.toUpperCase() ) {
        case "WIN32":
        case "WINDOWS":
            return 3;
        case "MAC68K":
        case "MACPPC":
        case "MACINTOSh":
        case "MACINTEl":
            return 1;
        default :
            return 0;
        }
    }

    static get_encoding_id ( name ) {
        switch( name.toUpperCase() ) {
        default : 
            return 0;
        case "UNICODE":
        case "UTF-8":
        case "UTF-16":
        case "UTF-32":
            return 1;
        case "SHIFTJIS":
            return 2;
        case "PRC":
            return 3;
        case "BIG5":
            return 4;
        case "WANSUNG":
            return 5;
        case "JOHAB":
            return 6;
        }
    }

    _parser () {
        if ( this.meta[ "cmap" ] ) {
            var cmap_stream = this._get_sfnt( "cmap" );
            this.cmap = new cmap( cmap_stream, {
                platform_id : this.params.platform_id,
                encoding_id : this.params.encoding_id,
            } );
        }

        if ( this.meta[ "head" ] ) {
            var head_stream = this._get_sfnt( "head" );
            this.head = new head( head_stream );
        }

        if ( this.meta[ "maxp" ] ) {
            var maxp_stream = this._get_sfnt( "maxp" );
            this.maxp = new maxp( maxp_stream );
        }

        if ( this.meta[ "loca" ] ) {
            var loca_stream = this._get_sfnt( "loca" );
            this.loca = new loca( loca_stream, {
                indexToLocFormat : this.head.indexToLocFormat,
                numGlyphs : this.maxp.numGlyphs,
            } );
        }

        if ( this.meta[ "glyf" ] ) {
            var glyf_stream = this._get_sfnt( "glyf" );
            this.glyf = new glyf( glyf_stream, {
                offsets : this.loca.offsets,
            } );
        }
    }

    parser () {
        this._offset_subtable.scaler_type = this.stream.getUint32();
        this._offset_subtable.numTables = this.stream.getUint16();
        this._offset_subtable.searchRange = this.stream.getUint16();
        this._offset_subtable.entrySelector = this.stream.getUint16();
        this._offset_subtable.rangeShift = this.stream.getUint16();

        console.log( this._offset_subtable );

        this.meta = {};

        for ( let i = 0; i < this._offset_subtable.numTables; i++ ) {
            var label = this.stream.getChar4(),
                checkSum = this.stream.getUint32(),
                offset = this.stream.getUint32(),
                length = this.stream.getUint32();

            this.meta[ label ] = {
                tag : label,
                checkSum : checkSum,
                offset : offset,
                length : length,
            }
        }

        console.log( this.meta )

        this._parser();
    }

    char ( code ) {
        if ( 'string' === typeof code ) {
            code = code.charCodeAt();
        }
        var glyphID = this.cmap.glyphID( code );
        console.log( glyphID );
        var glyph = this.glyf.glyph( glyphID );
        console.log( glyph );
    }
}