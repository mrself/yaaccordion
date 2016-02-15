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
		},

		/**
		 * Make item instance
		 * @param  {Element} el Header element
		 * @return {HeaderItem}
		 */
		makeItem: function(el) {
			var item = HeaderItem.make(el, this.options, this._panelDName);
			item.init(this._panelDName);
			return item;
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

