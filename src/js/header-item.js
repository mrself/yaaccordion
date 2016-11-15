/**
 * Header
 * class
 */

var Panel = require('./panel-item'),
	utils = require('./utils'),
	PubSub = require('./pub-sub');


/**
 * Represents accordion header
 * @constructor
 */
function Header () {
	/**
	 * State of header
	 * True - is expanded
	 * False - is contacted
	 * @type {boolean}
	 * @private
	 */
	this._state = null;

	/**
	 * Store to header element id
	 * @type {string}
	 * @private
	 */
	this._id = null;

	/**
	 * Observer instance for subscribing and triggering events
	 * @type {PubSub}
	 */
	this.events = PubSub.makeInst();
}
Header.prototype = {
	constructor: Header,
	_name: 'header',
	init: function(panelDName) {
		this._panelDName = panelDName;
		this.setId();
		this._defineState();
		this.panel = Panel.init(this._findPanelEl(), this._panelDName);
		this.panel.setHeaderId(this.getId());
		this._initArea();
		this.toggle(this._state, true);
	},

	/**
	 * Define state of header by option or attr
	 * @return {void}
	 */
	_defineState: function() {
		this._state = this.options.defaultState;
		switch (this.$el.attr('aria-expanded')) {
			case 'true': return this._state = true;
			case 'false': return this._state = false;
		}
	},

	/**
	 * Set id property
	 */
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

	/**
	 * Get id property
	 * @return {string} Id
	 */
	getId: function() {
		return this._id;
	},

	/**
	 * Init area attributes for element
	 * @return {void}
	 * @private
	 */
	_initArea: function() {
		this.$el
			.attr('role', 'tab')
			.attr('aria-controls', this.panel.getId())
			.attr('tabindex', -1);
		this._toggleArea(this._state);
	},

	/**
	 * Expand header
	 * @return {void}
	 */
	expand: function() {
		this.toggle(true);
	},

	/**
	 * Contract header
	 * @return {void}
	 */
	contract: function() {
		this.toggle(false);
	},

	/**
	 * Make header tabbable
	 * @return {void}
	 */
	makeTabbable: function() {
		this.$el.attr('tabindex', 0);
	},

	/**
	 * Make headeer untabbable
	 * @return {void}
	 */
	makeUnTabbable: function() {
		this.$el.attr('tabindex', -1);
	},

	/**
	 * Focus header
	 * @return {void}
	 */
	focus: function() {
		this.$el.attr('tabindex', 0).trigger('focus');
	},

	/**
	 * Toggle el state
	 * @param  {boolean} state true - expand, false - contrace, undefined = toogle current
	 * @return {void}
	 */
	toggle: function(state, force) {
		var self = this;
		if (typeof state == 'undefined') {
			this._state = !this._state;
		} else {
			if (state == this._state && !force) return;
			this._state = state;
		}
		this._toggleArea(this._state);
		this.panel.toggle(this._state, function() {
			self.events.trigger(self._state ? 'expand' : 'contract');
		});
	},

	/**
	 * Toggle area attributes on header and panel
	 * @return {void}
	 * @private
	 */
	_toggleArea: function() {
		this.$el.attr('aria-expanded', this._state).attr('aria-selected', this._state);
		this.panel.toggleArea(this._state);
	},

	/**
	 * Find panel element
	 * @return {jQuery}
	 * @private
	 */
	_findPanelEl: function() {
		return this.$el.next();
	},

	/**
	 * Get state property
	 * @return {boolean}
	 * @private
	 */
	getState: function() {
		return this._state;
	},
};

/**
 * Make istance object
 * @param  {Element} el     Header element
 * @param  {object} options All plugin options
 * @return {Header}
 */
Header.make = function(el, options) {
	var inst = new Header();
	inst.el = el;
	inst.$el = $(el);
	inst.options = options;
	inst.setId();
	return inst;
};
module.exports = Header;