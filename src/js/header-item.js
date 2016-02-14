/**
 * Header
 * Item
 */

var Panel = require('./panel-item');
var utils = require('./utils');
var PubSub = require('./pub-sub');

function Module () {
	this.events = PubSub.makeInst();
}
Module.prototype = {
	init: function() {
		this._name = this.options.names.header;
		// this.panelDName = this.options.names.panelDName;
		this.setId();
		this.panel = Panel.init(this._findPanelEl(), this.getId(), this._panelDName);
		this._defineState();
		this._initArea();
	},

	_defineState: function() {
		this._state = this.$el.data(utils.dataName('opened')) || this.options.defaultState;
	},

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
		this.$el.attr('role', 'tab').attr('aria-controls', this.panel.getId()).attr('tabindex', -1);
		this._toggleArea(this._state);
	},

	expand: function() {
		this.toggle(true);
	},

	contract: function() {
		this.toggle(false);
	},

	makeTabbable: function() {
		this.$el.attr('tabindex', 0);
	},

	makeUnTabbable: function() {
		this.$el.attr('tabindex', -1);
	},

	focus: function() {
		this.$el.attr('tabindex', 0).trigger('focus');
	},

	/**
	 * Toggle el state
	 * @param  {boolean} state true - expand, false - contrace, undefined = toogle current
	 * @return {[void]}
	 */
	toggle: function(state) {
		var self = this;
		if (typeof state == 'undefined') {
			this._state = !this._state;
		} else {
			if (state == this._state) return;
			this._state = state;
		}
		this._toggleArea(this._state);
		this.panel.toggle(this._state, function() {
			self.events.trigger('expand');
		});
	},

	_toggleArea: function() {
		this.$el.attr('aria-expanded', this._state).attr('aria-selected', this._state);
		this.panel.toggleArea(this._state);
	},

	_findPanelEl: function() {
		return this.$el.next();
	},

	getState: function() {
		return this._state;
	},
};
Module.init = function(el, options, panelDName) {
	var inst = new Module();
	inst.el = el;
	inst.$el = $(el);
	inst.options = options;
	inst._panelDName = panelDName;
	inst.init();
	return inst;
};
module.exports = Module;