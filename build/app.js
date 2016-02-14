(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Module () {
	
}
module.exports = Module;
},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
var Item = require('./item'),
	Panel = require('./panel'),
	Header = require('./header');

(function($, document, window, undefined) {
	function Plugin () {
		
	}
	var pluginName = 'yaaccordion',
		defaults = {
			_name: 'accordion',
			header: {
				selector: 'fabric'
			},
			panel: {
				selector: 'fabric'
			},
			makeWrap: false,
			multiselectable: false,
			firstExpanded: true,
			slideDuration: 400
		},
		dataName = function(name) {
			if (name) {
				return pluginName + '-' + name;
			}
			return pluginName;
		},
		uid = 0,
		idPrefix = 'yaac',
		makeUid = function(elName) {
			return idPrefix + '-' + elName.charAt(0) + '-' + uid++;
		},
		keyCodes = {
			BACKSPACE: 8,
			COMMA: 188,
			DELETE: 46,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			LEFT: 37,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			PERIOD: 190,
			RIGHT: 39,
			SPACE: 32,
			TAB: 9,
			UP: 38
		};
})(jQuery, document, window);

// module.exports = Plugin;
},{"./header":1,"./item":2,"./panel":4}],4:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}]},{},[3]);
