var utils = require('./utils');

function Panel () {
	/**
	 * Store panel element id
	 * @type {string}
	 * @private
	 */
	this._id = null;
}

Panel.prototype = {
	constructor: Panel,
	_name: 'panel',
	init: function() {
		this.setId();
		this.$el.addClass(this.dName);
		this._initArea();
	},

	/**
	 * Set 'id' property and id of element
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
	 * Set header id
	 * @param {string} id Header id
	 */
	setHeaderId: function(id) {
		this._headerId = id;
		this.$el.attr('labelledby', id);
	},

	/**
	 * Get 'id' property
	 * @return {string}
	 */
	getId: function() {
		return this._id;
	},

	/**
	 * Set aria attributes
	 * @return {void}
	 */
	_initArea: function() {
		// l(this._headerId)
		this.$el.attr('role', 'tabpanel');
	},

	/**
	 * Toggle aria attributes
	 * @param  {boolean} state State to toogle which
	 * @return {void}
	 */
	toggleArea: function(state) {
		this.$el.attr('aria-hidden', state);
	},

	/**
	 * Toogle state
	 * @param  {boolean}  state State to toogle which
	 * @param  {Function} cb    Callback
	 * @return {void}
	 */
	toggle: function(state, cb) {
		this.$el.attr('aria-hidden', state);
		if (state) {
			this.$el.slideDown('fast', cb);
		} else {
			this.$el.slideUp('fast', cb);
		}
	},
};

/**
 * Make instance of panel and init
 * @param  {jQuery} $el   jQuery element of header
 * @param  {string} dName document name
 * @return {Panel}
 */
Panel.init = function($el, dName) {
	var inst = new Panel();
	inst.$el = $el;
	inst.dName = dName;
	inst.init();
	return inst;
};
module.exports = Panel;