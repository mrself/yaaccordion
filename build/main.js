function l(x) {
	console.log(x);
}
;(function ($, document, window, undefined) {
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
			multiselectable: false
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
							this.initDel({
								namespace: pluginName
							});
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
								this.active = this.items[0];
								this.active.expand();
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

						next: function(type) {
							type = type || 'active';
							(this.items[this[this._actions[type]].index + 1] || this.items[0])[type]();
						},

						prev: function(type) {
							type = type || 'active';
							(this.items[this[this._actions[type]].index - 1] || this.items[this.items.length - 1])[type]();
						},
						first: function(type) {
							type = type || 'active';
							return this.items[0][type]();
						},
						last: function(type) {
							type = type || 'active';
							return this.items[this.items.length - 1][type]();
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
						this.$el.aria('hidden', false);
					},

					collapse: function() {
						this.removeMod('expanded');
						this.$el.aria('hidden', true);
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
						self.e.header.next('focus');
						return false;

					case keyCodes.UP:
					case keyCodes.LEFT:
						self.e.header.prev('focus');
						return false;

					case keyCodes.HOME:
						self.e.header.first('focus');
						return false;

					case keyCodes.END:
						self.e.header.last('focus');
						return false;

					case keyCodes.ENTER:
					case keyCodes.SPACE:
						self.e.header.toggleFocused();
						return false;
				}
			};

			// api works properly only if option multiselectable is enabled
			$.each(['next', 'prev', 'first', 'last'], function(index, el) {
				events[self.makeEventName(el)] = function() {
					self.e.header[el]('expand');
					return false;
				};
			});
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