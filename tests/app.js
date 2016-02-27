(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var defaults = {
	$elName: '$el',
	elSep: '__',
	modSep: '--',
	namespace: null
};

if (typeof $ == 'undefined') {
	if (typeof jQuery == 'undefined') {
		throw new Error('ya-del: jQuery is not defined');
	} else $ = jQuery;
}

module.exports = {
	initDel: function(options) {
		this.DelOptions = $.extend({}, defaults, options);
		this.dName = this.dName || this._name;
		this.selector = this.selector || '.' + this.dName;
		this.namespace = this.DelOptions.namespace || this.dName;
	},

	makeName: function(elName, modName) {
		var name = this.dName;
		if (elName) {
			if (!Array.isArray(elName)) elName = [elName];
			name += this.DelOptions.elSep + elName.join(this.DelOptions.elSep);
		}
		if (modName) name += this.DelOptions.modSep + modName;
		return name;
	},

	/**
	 * Add property $dName to el classes
	 */
	setName: function() {
		this.$el.addClass(this.dName);
	},

	makeSelector: function() {
		return '.' + this.makeName.apply(this, arguments);
	},

	find: function() {
		return this._smartArgs(function($el, args, context) {
			return $el.find(context.makeSelector.apply(context, args));
		}, arguments);
	},

	/**
	 * Find element in other el
	 * @param {jQuery|string|DOMElement} el el to find in
	 * @param {string|array} element name
	 * @return {jQuery}
	 */
	findIn: function(el) {
		return (el instanceof $ ? el : $(el)).find(this.makeSelector.apply(this, [].slice.call(arguments, 1)));
	},

	/**
	 * Make full el name by modifier
	 * @param  {string} name       modifier name
	 * @param  {bool} toSelector   to prepend selector mark on not
	 * @return {string}            full el name/selector
	 */
	modName: function(name, toSelector) {
		var selectorMark = toSelector ? '.' : '';
		return selectorMark + this.makeName('', name);
	},

	hasMod: function(name) {
		return this._smartArgs(function($el, args, context) {
			return $el.hasClass(context.modName(args[0]));
		}, arguments);
	},

	/**
	 * Filter function that defines first argument for methods.
	 * @param  {Function} callback callback
	 * @param  {arguments}   args  Arguments of first method
	 * @return {n/a}
	 */
	_smartArgs: function(callback, args) {
		if (args[0] instanceof $)
			return callback(args[0], [].slice.call(args, 1), this);
		else
			return callback(this[this.DelOptions.$elName], args, this);
	},

	addMod: function(name) {
		this._smartArgs(function($el, args, context) {
			$el.addClass(context.modName(args[0]));
		}, arguments);
	},
	filterByMod: function(name) {
		return this._smartArgs(function($el, args, context) {
			return $el.filter('.' + context.modName(args[0]));
		}, arguments);
	},

	removeMod: function(name) {
		this._smartArgs(function($el, args, context) {
			$el.removeClass(context.modName(args[0]));
		}, arguments);
	},

	toggleMod: function(name, state) {
		this._smartArgs(function($el, args, context) {
			args[0] = context.modName(args[0]);
			$.fn.toggleClass.apply($el, args);
		}, arguments);
	},

	eventName: function(name) {
		return name + '.' + this.namespace;
	},

	/**
	 * jquery like 'on'. Attach event to this.$el or with delegation.
	 * 
	 * @example
	 * obj.on('click', 'elName', handler)
	 * obj.on('click', handler)
	 * 
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	on: function(name) {
		var args = arguments;
		args[0] = this.eventName(name);
		this._smartArgs(function($el, args, context) {
			$.fn.on.apply($el, args);
		}, args);
	},

	/**
	 * Opposite to #on
	 */
	off: function(name) {
		this._smartArgs(function($el, args, context) {
			$el.off(context.eventName(name));
		}, arguments);
	},
	trigger: function(name) {
		this._smartArgs(function($el, args, context) {
			$el.trigger(context.eventName(name));
		}, arguments);
	},

	createEl: function(name, tagName) {
		return $('<' + (tagName || 'div') + ' />', {
			'class': this.makeName(name)
		});
	}
};
},{}],2:[function(require,module,exports){
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
},{"./panel-item":5,"./pub-sub":6,"./utils":7}],3:[function(require,module,exports){
module.exports = {
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
},{}],4:[function(require,module,exports){
window.l = function(x) {
	console.log(x);
};

var HeaderItem = require('./header-item');

var Del = require('ya-del');
var utils = require('./utils');
var keyCodes = require('./key-codes');
(function($, document, window, undefined) {
	
	var pluginName = 'yaaccordion',
		defaults = {
			name: 'accordion',
			names: {
				header: 'header',
				panel: 'panel'
			},
			headerEl: null,
			makeWrap: false,
			multiselectable: false,
			firstExpanded: true,
			slideDuration: 400,
			defaultState: false // true - opened, false - closed
		};

	function Plugin (el, options) {
		/**
		 * 'Item' is a general name for HeaderItem. It is used as management for panel.
		 * 'item' 's names are related to HeaderItems. E.g., _items - collection of HeaderItems instances.
		 * 
		 */
		this.el = el;
		this.options = $.extend({}, defaults, options);
		this._items = {};
		this._itemsId = [];
		this._tabbable = null; // id of tabbable item
		this.$panel = $([]);
	}
	$.extend(Plugin.prototype, {
		init: function() {
			this.dName = this.options.name;
			this.$el = $(this.el);
			this.initDel({namespace: pluginName});
			this._initArea();
			this._defineHeaderEl();
			this._defineNames();
			this._makeItems();
			this._initEvents();
		},

		_initArea: function() {
			this.$el.attr('role', 'tablist');
		},

		_defineHeaderEl: function() {
			if (this.options.headerEl && this.options.headerEl instanceof jQuery) {
				this.$header = this.options.headerEl;
			} else {
				this.$header = this.find(this.options.names.header);
			}
		},

		_defineNames: function() {
			this._headerDName = this.makeName(this.options.names.header);
			this._panelDName = this.makeName(this.options.names.panel);
		},

		_initEvents: function() {
			var self = this;
			this.$el.on(this.eventName('click'), '.' + this._headerDName, function() {
				self.getById(this.id).toggle();
			}).on(this.eventName('keydown'), '.' + this._headerDName, function(evt) {
				switch (evt.which) {
					case keyCodes.DOWN:
					case keyCodes.RIGHT:
						self.focusNext();
						return;

					case keyCodes.UP:
					case keyCodes.LEFT:
						if (!evt.ctrlKey)
							self.focusPrev();
						return;

					case keyCodes.HOME:
						self.focusFirst();
						return;

					case keyCodes.END:
						self.focusLast();
						return;

					case keyCodes.ENTER:
					case keyCodes.SPACE:
						self.toggle(this.id);
						return;
				}
			}).on(this.eventName('keydown'), function(evt) {
				switch (evt.which) {
					case keyCodes.UP:
					case keyCodes.LEFT:
						if (evt.ctrlKey) {
							self.getById(self._tabbable).focus();
						}
						return;

				}
			}).on(this.eventName('focusin'), function(ev) {
				var $panel = self.$panel.has(ev.target);
				if ($panel.length)
					self._tabbable = $panel.attr('labelledby');
			});
		},

		_makeItems: function() {
			var self = this;
			this.$header.each(function() {
				self.addItem(self.makeItem(this));
			});
			if (this._tabbable === null) {
				var first = this.first();
				first.makeTabbable();
				this._tabbable = first.getId();
			}
		},

		focusNext: function() {
			var item;
			if (this._tabbable) {
				this._items[this._tabbable].makeUnTabbable();
				item = this.getNext(this._tabbable);
			} else item = this.first();
			this._tabbable = item.getId();
			item.focus();
		},

		focusPrev: function() {
			var item;
			if (this._tabbable) {
				this._items[this._tabbable].makeUnTabbable();
				item = this.getPrev(this._tabbable);
			} else item = this.last();
			this._tabbable = item.getId();
			item.focus();
		},

		focusFirst: function() {
			this._makeUnTabbable();
			var first = this.first();
			first.focus();
			this._tabbable = first.getId();
		},

		/**
		 * Make tabbable item untabbable
		 * @return {void}
		 */
		_makeUnTabbable: function() {
			if (this._tabbable) {
				this._items[this._tabbable].makeUnTabbable();
			}
		},

		/**
		 * Get next item of item with id
		 * @param  {string} id Id of current item
		 * @return {HeaderItem}
		 */
		getNext: function(id) {
			if (!id) return;
			var index = this._itemsId.indexOf(id);
			return (item = this.getById(this._itemsId[index + 1])) || this.first();
		},

		/**
		 * Get prev item of item with id
		 * @param  {string} id Id of current item
		 * @return {HeaderItem}
		 */
		getPrev: function(id) {
			if (!id) return;
			var index = this._itemsId.indexOf(id);
			return (item = this.getById(this._itemsId[index - 1])) || this.last();
		},

		focusLast: function() {
			this._makeUnTabbable();
			var last = this.last();
			last.focus();
			this._tabbable = last.getId();
		},

		/**
		 * Toggle tabbable item
		 * @return {void}
		 */
		toggleTabbable: function() {
			this.getById(this._tabbable).toggle();
		},

		toggle: function(id) {
			this.getById(id).toggle();
		},

		/**
		 * Add item
		 * @param {HeaderItem} item
		 */
		addItem: function(item) {
			this._items[item.getId()] = item;
			var self = this;
			item.events.on('expand', function(e) {
				self._onExpand(item);
			});
			item.events.on('contract', function(e) {
				self._onContract(item);
			});
			item.init(this._panelDName);
			this.$panel = this.$panel.add(item.panel.$el);
			if (this._itemsId.push(item.getId()) === 1 && this.options.firstExpanded) {
				item.expand();
			}
		},

		_onExpand: function(item) {
			if (this._tabbable) {
				this._items[this._tabbable].makeUnTabbable();
			}
			item.makeTabbable();
			this._tabbable = item.getId();
			this.$el.trigger(this.eventName('expand'), item);
		},

		_onContract: function(item) {
			if (this._tabbable) {
				this._items[this._tabbable].makeUnTabbable();
			}
			item.makeTabbable();
			this._tabbable = item.getId();
			this.$el.trigger(this.eventName('contract'), item);
		},

		/**
		 * Make item instance
		 * @param  {Element} el Header element
		 * @return {HeaderItem}
		 */
		makeItem: function(el) {
			return HeaderItem.make(el, this.options);
		},

		/**
		 * Get first item
		 * @return {HeaderItem}
		 */
		first: function() {
			return this.get(0);
		},

		/**
		 * Get last item
		 * @return {HeaderItem}
		 */
		last: function() {
			return this.get(this._itemsId.length - 1);
		},

		/**
		 * Get item
		 * @param  {number} order Order of item in accordion
		 * @return {HeaderItem}
		 */
		get: function(order) {
			return this._items[this._itemsId[order]];
		},

		/**
		 * Get item
		 * @param  {string} id Item id
		 * @return {HeaderItem}
		 */
		getById: function(id) {
			return this._items[id];
		}
	}, Del);

	Plugin.init = function(el, options) {
		var instance = new Plugin(el, options);
		instance.init();
		$.data(el, 'plugin_' + pluginName, instance);
	};
	Plugin.HeaderItem = HeaderItem;
	$[pluginName] = Plugin;

	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if ($.data(this, 'plugin_' + pluginName)) {
				if (options.reinit) {
					Plugin.init(this, options);
				}
			} else {
				Plugin.init(this, options);
			}
		});
	};
})(jQuery, document, window);


},{"./header-item":2,"./key-codes":3,"./utils":7,"ya-del":1}],5:[function(require,module,exports){
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
},{"./utils":7}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
var uid = 0,
	pluginName = 'yaaccordion',
	idPrefix = 'yaac';

module.exports = {
	dataName: function(dataKey) {
		if (dataKey) {
			return pluginName + '-' + dataKey;
		}
		return pluginName;
	},
	makeUid: function(elName) {
		return idPrefix + '-' + elName.charAt(0) + '-' + uid++;
	}
};
},{}]},{},[4]);
