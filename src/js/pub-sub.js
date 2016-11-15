/**
 * Utils
 *
 * util
 *
 * Require property '_events' as simple Object for saving events
 *
 * example:
 * var MyModule = funciton() {
 * 	this._events = {};
 * }
 * PubSub.extend(MyModule);
 * // now you can use #on and # trigger
 */

function Module () {
	this._events = {};
}
Module.prototype = {
	on: function(name, fn) {
		if (!this._events[name]) this._events[name] = [];
		this._events[name].push(fn);
	},

	trigger: function(name, data) {
		if (!this._events[name] || !this._events[name].length) return;
		this._events[name].forEach(function(event) {
			event(data || {});
		});
	}
};

Module.extend = function(_class) {
	$.extend(_class.prototype, Module.prototype);	
};
Module.makeClass = function() {
	var PubSub = function() {this._events = {};};
	Module.extend(PubSub);
	return PubSub;
};
Module.makeInst = function() {
	var PubSub = function() {this._events = {};};
	Module.extend(PubSub);
	return new PubSub;
};

module.exports = Module;