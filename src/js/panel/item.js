var utils = require('../utils');

function Module () {
	this.init = function() {
		this.setId();
		this.$el.addClass(this.dName);
		this._initArea();
	};
}
Module.prototype = {
	_name: 'panel',
	setId: function() {
		var id = this.$el[0].id;
		if (!id) {
			id = utils.makeUid(this._name);
			this.$el[0].id = id;
			this._id = id;
		} else {
			this._id = id;
		}
	},
	getId: function() {
		return this._id;
	},
	_initArea: function() {
		this.$el.attr('role', 'tabpanel').attr('labelledby', this._headerId);
	},
	toggleArea: function(state) {
		this.$el.attr('aria-hidden', state);
	},
	toggle: function(state, cb) {
		this.$el.attr('aria-hidden', state);
		if (state) {
			this.$el.slideDown('fast', cb);
		} else {
			this.$el.slideUp('fast', cb);
		}
	},
};
Module.init = function($el, headerId, dName) {
	var inst = new Module();
	inst.$el = $el;
	inst._headerId = headerId;
	inst.dName = dName;
	inst.init();
	return inst;
};
module.exports = Module;