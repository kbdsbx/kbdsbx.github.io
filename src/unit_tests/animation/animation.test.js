var animation = require( "../../lib/animation/animation.js" );
var expect = require( "chai" ).expect;

describe( "animation", function() {
    describe( "#bind()", function() {
        it( "check property after called [bind] function", function() {
            expect( new animation().bind( "var onsize", function () { this.width = 10; } ) )
                .to.deep.own.instanceof( animation )
                .have.own.property( '_events' )
                .have.own.property( "var onsize" )
                .have.own.property( 0 )
                .to.be.a( "function" );
        } );

        it( "check property modify after event trigger.", function() {
            global.__test_bind_function = 0;

            let ani = new animation();
            expect( ani ).to.have.property( "width" ).that.equal( 0 );
            expect( global.__test_bind_function ).to.be.a( "number" );
            ani.bind( "global.__test_bind_function", function() { this.width = 10 } );
            expect( global.__test_bind_function ).to.be.a( "function" );
            global.__test_bind_function.call( ani );
            expect( ani ).to.have.property( "width" ).that.equal( 10 );

            delete global.__test_bind_function;
        } );
    } );
} );