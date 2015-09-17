(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Module class must have properties: selector, dName, $el
 */

/*
TODO:
 */


(function($) {
	/*function Constructor() {
		this.$el = $('.el');
		this.dName = 'el';
		this.selector = '.el';
		this._name = 'el';
	}
	function Constructor2() {
		this.$el = $('.module__el');
		this.dName = 'module__el';
		this.selector = '.module__el';
		this._name = 'el';
	}*/

	var defaults = {
		$elName: '$el',
		elSep: '__',
		modSep: '--',
		namespace: null
	};
	var Prototype = {
		initDel: function(options) {
			this.DelOptions = $.extend(true, {}, defaults, options);
			this.dName = this.dName || this._name;
			this.selector = this.selector || '.' + this.dName;
			this.namespace = this.DelOptions.namespace || this.dName;
		},

		makeName: function(elName, modName) {
			var name = this.dName;
			if (elName) name += this.DelOptions.elSep + elName;
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

		findIn: function($elSelector) {
			return $($elSelector).find(this.makeSelector.apply(this, [].slice.call(arguments, 1)));
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

		/*deprecated*/
		makeEventName: function(name) {
			return name + '.' + this.dName;
		},

		on: function(name) {
			var args = arguments;
			args[0] = this.eventName(name);
			this._smartArgs(function($el, args, context) {
				$.fn.on.apply($el, args);
			}, args);
		},

		off: function(name) {
			this._smartArgs(function($el, args, context) {
				$el.off(context.eventName(name));
			}, arguments);
		},
		trigger: function(name) {
			this._smartArgs(function($el, args, context) {
				$el.trigger(context.eventName(name));
			}, arguments);
		}
	};
	module.exports = Prototype;

})(jQuery);


},{}],2:[function(require,module,exports){
/*
TODO:
	add ctrl UP handler
 */
 
;(function ($, document, window, undefined) {
	$.Del = require('ya-del');

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
		makeClass = function(constructor, prototype) {
			constructor.prototype = prototype;
			return constructor;
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
		},
		classes = {
			wrap: {
				single: makeClass(function($el, collection) {
					this.$el = $el;
					this.collection = collection;
					this.init();
				}, $.extend({
					init: function() {
						this.$el.addClass(this.collection.dName);
					}
				}, $.Del)
				),
				collection: makeClass(function(plugin) {
					this.plugin = plugin;
					this.init();
				}, $.extend({
					_name: 'wrap',
					init: function() {
						this.items = [];
						this.$el = $([]);
						this.dName = this.plugin.makeName(this._name);
						this.initDel({
							namespace: pluginName
						});
						this._make$wrap();
					},
					_make$wrap: function() {
						this._$wrap = $('<div />', {
							class: this.dName
						});
					},
					add: function($header, $panel) {
						$header.add($panel).wrapAll(this._$wrap.clone());
						this.$el = this.$el.add(this._$wrap);
						this.items.push(new classes.wrap.single(this._$wrap, this));
					}
				}, $.Del)
				)
			},

			header: {
				single: makeClass(function(el, collection) {
						this.el = el;
						this.$el = $(el);
						this.collection = collection;
					}, $.extend({
						init: function() {
							this.dName = this.collection.dName;
							this.initDel({
								namespace: pluginName
							});
							this.dataOptions = this.$el.data(dataName());
							if (this.dataOptions) {
								this.expanded = this.dataOptions.expanded || false;
							} else {
								this.expanded = false;
							}
							
							this._initEvents();
							this._initAria();
							if (this.expanded) {
								this.expand();
							}
						},

						_initEvents: function() {
							var that = this;
							this.on('expand', function() {
								that.expand();
								return false;
							});
							this.on('collapse', function() {
								that.collapse();
								return false;
							});
							this.on('click', function() {
								if (!that.collection.isCollapseAllowed(that)) return;
								that.toggle();
							});
							this.on('focus', function() {
								that.makeTabbable();
								that.collection.setFocused(that);
							});
						},

						makeTabbable: function() {
							this.$el.attr('tabindex', 0);
						},
						makeUntabbable: function() {
							this.$el.attr('tabindex', -1);
						},

						_initAria: function() {
							this.$el
								.aria('expanded', this.expanded)
								.addRole('tab')
								.attr('tabindex', -1)
								.aria('controls', this.panel.getId());
							if (!this.$el[0].id) {
								this.$el[0].id = this.id = makeUid(this.collection._name);
							}
							this.panel.$el.aria('hidden', this.expanded).aria('labelledby', this.id);
						},

						focus: function() {
							this.$el.trigger('focus');
						},

						expand: function(makeFocus) {
							this.collection.beforeChange();
							this.addMod('expanded');
							this.collection.onChange(this);
							this.$el
								.aria('expanded', true)
								.attr('tabindex', 0);
							this.panel.expand();
							this.expanded = true;
							
							if (makeFocus)
								this.$el.trigger('focus');
						},

						collapse: function(makeFocus) {
							
							this.removeMod('expanded');
							this.collection.onChange(this);
							this.$el
								.aria('expanded', false)
								.attr('tabindex', 0);
							this.panel.collapse();
							this.expanded = false;
						},

						toggle: function() {
							if (this.expanded) {
								this.collapse();
							} else {
								this.expand();
							}
						},

						findPanel: function() {
							return this.$el.nextUntil(this.collection.selector);
						},
						destroy: function() {
							this.$el
								.removeAria('expanded')
								.removeAria('controls')
								.removeAttr('tabindex')
								.removeClass(this.collection.dName)
								.removeAttr('role');
							this.removeMod('expanded');
							this.$el.off('.' + pluginName);
						}
					}, $.Del)
				),
				collection: makeClass(function(plugin) {
						this.plugin = plugin;
						this.options = plugin.options[this._name];
						this.init();
					}, $.extend({
						_name: 'header',
						init: function() {
							this.dName = this.plugin.makeName(this._name);
							this.initDel({namespace: pluginName});
							this.$el = this.options.selector == 'fabric' ? 
								this.plugin.find(this._name) : 
								this.plugin.$el.find(this.options.selector).addClass(this.dName);
							
							this._makeInstances();
						},

						_makeInstances: function() {
							var that = this;
							this.items = [];
							var selected = false;
							this.$el.each(function(index, el) {
								var header = new classes.header.single(el, that);
								header.index = index;
								var panel = that.plugin.e.panel.add(header.findPanel());
								panel.header = header;
								if (that.plugin.options.makeWrap)
									that.plugin.e.wrap.add(header.$el, panel.$el);
								header.panel = panel;
								header.init();
								if (header.expanded) {
									selected = true;
								}
								that.items.push(header);
							});
							if (!selected) {
								if (this.plugin.options.firstExpanded) {
									this.active = this.items[0];
									this.active.expand();
								} else this.items[0].makeTabbable();
								
							}
						},

						onChange: function(header) {
							if (this.active) {
								this.active.$el.attr('tabindex', -1);
							}
							this.active = header;
						},
						beforeChange: function() {
							if (!this.plugin.options.multiselectable) {
								for (var i = 0; i < this.items.length; i++) {
									this.items[i].collapse();
								}
							}
						},
						isCollapseAllowed: function(header) {
							if (this.plugin.options.multiselectable) return true;
							var expandedIds = [],
								i;
							for (i = 0; i < this.items.length; i++) {
								if (this.items[i].expanded) {
									expandedIds.push(this.items[i].id);
								}
							}
							return !(expandedIds.length === 1 && expandedIds.indexOf(header.id) != -1);
						},
						_actions: {
							expand: 'active',
							focus: 'focused'
						},
						focusNext: function() {
							this.focused.makeUntabbable();
							(this.items[this.focused.index + 1] || this.items[0]).focus();
						},

						focusPrev: function() {
							this.focused.makeUntabbable();
							(this.items[this.focused.index - 1] || this.items[this.items.length - 1]).focus();
						},
						focusFirst: function() {
							this.focused.makeUntabbable();
							return this.items[0].focus();
						},
						focusLast: function() {
							this.focused.makeUntabbable();
							return this.items[this.items.length - 1].focus();
						},

						toggleFocused: function() {
							this.focused.toggle();
						},
						setFocused: function(header) {
							this.focused = header;
						},

						destroy: function() {
							for (var i = 0; i < this.items.length; i++) {
								this.items[i].destroy();
							}
						}

					}, $.Del)
				)
			},
			panel: {
				single: makeClass(function($el, collection) {
					this.$el = $el;
					this.collection = collection;
					this.init();
				}, $.extend({
					init: function() {
						this.$el.addClass(this.collection.dName);
						this.dName = this.collection.dName;
						this.initDel({
							namespace: pluginName
						});
						this.$el.attr('role', 'tabpanel');
					},

					getId: function() {
						var id = this.$el[0].id;
						if (!id) {
							id = makeUid(this.collection._name);
							this.$el[0].id = id;
						}
						return id;
					},

					expand: function() {
						this.addMod('expanded');
						this.$el.aria('hidden', false).slideDown(this.collection.plugin.options.slideDuration);
					},

					collapse: function() {
						this.removeMod('expanded');
						this.$el.aria('hidden', true).slideUp(this.collection.plugin.options.slideDuration);
					},

					toggle: function(expanded) {
						expanded ? this.expand() : this.collapse();
					},
					destroy: function() {
						this.$el
							.removeAria('hidden')
							.removeAria('labelledby')
							.removeAttr('role')
							.removeClass(this.collection.dName);
						this.removeMod('expanded');
						this.$el.off('.' + pluginName);
					}
				}, $.Del)
				),
				collection: makeClass(function(plugin) {
					this.plugin = plugin;
					this.options = plugin.options[this._name];
					this.init();
				}, $.extend({
					_name: 'panel',
					init: function() {
						var that = this;
						this.dName = this.plugin.makeName(this._name);
						this.initDel({
							namespace: pluginName
						});
						// this.$el = this.options.selector == 'fabric' ? this.plugin.find(this._name) : $(this.options.selector).addClass(this.dName);
						if (this.plugin.options.makeWrap) {
							this.$el = $([]);
						} else if (this.options.selector == 'fabric') {
							this.$el = this.plugin.find(this._name);
						} else {
							this.$el = this.plugin.$el.find(this.options.selector).addClass(this.dName);
						}
						this.items = [];
					},
					add: function($panel) {
						var panel = new classes.panel.single($panel, this);
						this.$el = this.$el.add(panel.$el);
						this.items.push(panel);
						return panel;
					},

					destroy: function() {
						for (var i = 0; i < this.items.length; i++) {
							this.items[i].destroy();
						}
					}
				}, $.Del)
				)

			}
		};

	function Plugin(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = $.extend(true, {}, defaults, options);
		this.init();
	}

	$.extend(Plugin.prototype, {
		init: function() {
			this._name = this.dName = this.options._name;
			this.initDel({
				namespace: pluginName
			});
			this._initEls();
			this._initEvents();
			this._initAria();
		},

		destroy: function() {
			this.e.header.destroy();
			this.e.panel.destroy();
			this.$el.removeAria('multiselectable').removeAttr('role')
				.off('.' + pluginName)
				.removeData('plugin_' + pluginName);
		},

		setOptions: function(options) {
			$.extend(this.options, options);
		},

		_initEls: function() {
			this.e = {};
			this.e.wrap = new classes.wrap.collection(this);
			this.e.panel = new classes.panel.collection(this);
			this.e.header = new classes.header.collection(this);
		},


		_initAria: function() {
			this.$el
				.addRole('tablist')
				.aria('multiselectable', this.options.multiselectable);
		},

		_initEvents: function() {
			var self = this;
			var events = {};
			events[self.makeEventName('keydown')] = function(evt) {
				switch (evt.keyCode) {
					case keyCodes.DOWN:
					case keyCodes.RIGHT:
						self.e.header.focusNext();
						return false;

					case keyCodes.UP:
					case keyCodes.LEFT:
						self.e.header.focusPrev();
						return false;

					case keyCodes.HOME:
						self.e.header.focusFirst();
						return false;

					case keyCodes.END:
						self.e.header.focusLast();
						return false;

					case keyCodes.ENTER:
					case keyCodes.SPACE:
						self.e.header.toggleFocused();
						return false;
				}
			};

			// were custom triggers. disabled for now
			// $.each(['next', 'prev', 'first', 'last'], function(index, el) {
			// 	events[self.makeEventName(el)] = function() {
			// 		self.e.header[el]('expand');
			// 		return false;
			// 	};
			// });
			this.$el.on(events);
		}
	}, $.Del);
	
	$[pluginName] = Plugin;

	$.fn[pluginName] = function(options) {
		return this.each(function(index, el) {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, document, window);
},{"ya-del":1}]},{},[2]);
