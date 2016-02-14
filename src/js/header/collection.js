/**
 * Header
 * Collection
 */

var Panel = require('../panel/item');
var Item = require('./item');

function Module () {
	this._items = [];
}
Module.prototype = {
	init: function() {
		var self = this;
		this.$el.each(function() {
			self._items.push(Item.init(this, self.panelDName));
		});
		
	},

	first: function() {
		return this._items[0];
	},
};
Module.init = function($el, dName, panelDName) {
	var inst = new Module();
	inst.$el = $el;
	inst.dName = dName;
	this.panelDName = panelDName;
	inst.init();
	return inst;
};
module.exports = Module;