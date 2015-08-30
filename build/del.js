/**
 * Module class must have properties: selector, dName, $el
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
			this.selector = this.selector || '.' + this.dName;
			this.namespace = this.DelOptions.namespace || this.dName;
		},

		makeName: function(elName, modName) {
			var name = this.dName;
			if (elName) name += this.DelOptions.elSep + elName;
			if (modName) name += this.DelOptions.modSep + modName;
			return name;
		},

		makeSelector: function() {
			return '.' + this.makeName.apply(this, arguments);
		},

		find: function() {
			return this[this.DelOptions.$elName].find(this.makeSelector.apply(this, arguments));
		},

		findIn: function($elSelector) {
			return $($elSelector).find(this.makeSelector.apply(this, [].slice.call(arguments, 1)));
		},

		modName: function(name) {
			return this.makeName('', name);
		},

		hasMod: function(name) {
			return this[this.DelOptions.$elName].hasClass(this.modName(name));
		},

		addMod: function(name) {
			this[this.DelOptions.$elName].addClass(this.modName(name));
		},

		removeMod: function(name) {
			this[this.DelOptions.$elName].removeClass(this.modName(name));
		},

		toggleMod: function(name) {
			this[this.DelOptions.$elName].toggleClass(this.modName(name));
		},

		makeEventName: function(name) {
			return name + '.' + this.namespace;
		},

		on: function(name, handler) {
			this[this.DelOptions.$elName].on(this.makeEventName(name), handler);
		},

		off: function(name) {
			this[this.DelOptions.$elName].off(this.makeEventName(name));
		}
	};
	$.Del = Prototype;


})(jQuery);

