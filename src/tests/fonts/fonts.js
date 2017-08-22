"use strict"

importScripts( "../../lib/fonts/fonts.js" );

var _this = this;

// cmap 2 4 2
var f = new Fonts( "../../fonts/BahiaScriptSSK.ttf", { platform : "Win32", encoding : "UTF-8" }, function( data ) {
    _this.onmessage = function( e ) {
        var c = e.data;
        var char_glyf = f.char( c );
        postMessage( char_glyf );
    }
// cmap 4
// var f = new Fonts( "../../fonts/我字酷默陌写意水墨体.ttf", function( data ) {
// cmap 4 6 4
// var f = new Fonts( "../../fonts/Switzerl.ttf", function( data ) {
// cmap 4 4 12
// var f = new Fonts( "../../fonts/msyh.ttf", function( data ) {
// cmap 4 12 6 4 12
// var f = new Fonts( "../../fonts/NotoSansHans-Black.otf", function( data ) {
// var f = new Fonts( "../../fonts/NotoSansHans-Bold.otf", function( data ) {
} );