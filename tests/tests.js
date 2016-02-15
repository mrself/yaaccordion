var expect = chai.expect;
var assert = chai.assert;
var keyCodes = {
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

function makeFixture (options) {
	options = $.extend({
		count: 4,
		headerClass: 'accordion__header'
	}, options);
	var $fixture = $('<div />', {"class": 'accordion'});
	for (var i = 0; i < options.count; i++) {
		$fixture.append($('<div />', {"class": options.headerClass}));
		$fixture.append($('<div />', {"class": 'accordion__panel'}));
	}
	return $fixture;
}
function initPlugin (fixtureOptions, pluginOptions) {
	fixtureOptions = $.extend({
		
	}, fixtureOptions);
	pluginOptions = $.extend({
		
	}, pluginOptions);
	var $el = makeFixture(fixtureOptions);
	$el.yaaccordion(pluginOptions);
	var inst = $el.data('plugin_yaaccordion');
	return {inst: inst, $el: $el};
}

describe('Global variables', function() {
	it('exist in $.fn and in $', function() {
		assert.typeOf($.yaaccordion, 'function');
		assert.typeOf($.fn.yaaccordion, 'function');
	});
});
var _beforeEachFn = function() {
	this.$el = makeFixture().yaaccordion({
		firstExpanded: false
	});
	this.inst = this.$el.data('plugin_yaaccordion');
};
describe('Init', function() {
	beforeEach(_beforeEachFn);
	it ('object has proper instance', function() {
		assert(this.inst instanceof $.yaaccordion);
	});

	describe('keydown events', function() {
		it('next', function() {
			var e = $.Event('keydown');
			e.which = keyCodes.RIGHT;
			this.$el.trigger(e);
			assert(this.inst.get(1).getId() == this.inst._tabbable);
		});

		it('next twice', function() {
			var e = $.Event('keydown');
			e.which = keyCodes.RIGHT;
			this.$el.trigger(e);
			this.$el.trigger(e);
			assert(this.inst.get(2).getId() == this.inst._tabbable);
		});

		it('prev', function() {
			var e = $.Event('keydown');
			e.which = keyCodes.LEFT;
			this.$el.trigger(e);
			assert(this.inst.last().getId() == this.inst._tabbable);
		});

		it('toggle on space / enter', function() {
			var focused = this.inst.getById(this.inst._tabbable);
			var state = focused.getState();
			var e = $.Event('keydown');
			e.which = keyCodes.ENTER;
			this.$el.trigger(e);
			assert(focused.getState() !== state);
		});

		it('home', function() {
			var e = $.Event('keydown');
			e.which = keyCodes.HOME;
			this.$el.trigger(e);
			assert(this.inst.first().getId() == this.inst.getById(this.inst._tabbable).getId());
		});

		it('end', function() {
			var e = $.Event('keydown');
			e.which = keyCodes.END;
			this.$el.trigger(e);
			assert(this.inst.last().getId() == this.inst.getById(this.inst._tabbable).getId());
		});

	});
});

describe('Component', function() {
	beforeEach(_beforeEachFn);
	describe ('#_defineHeaderEl', function() {
		it('set header el by option "headerEl" as jQuery el', function() {
			var $fixture = makeFixture({headerClass: 'accordion__myheader'});
			var $header = $fixture.find('.accordion__myheader');
			$fixture.yaaccordion({headerEl: $header});
			var inst = $fixture.data('plugin_yaaccordion');
			assert(inst.$header[0] == $header[0]);
		});

		it('look for header el by header name option if  "headerEl" is null', function() {
			var $fixture = makeFixture({headerClass: 'accordion__myheader'});
			var $header = $fixture.find('.accordion__myheader');
			$fixture.yaaccordion({names: {header: 'myheader'}});
			var inst = $fixture.data('plugin_yaaccordion');
			assert(inst.$header[0] == $header[0]);
		});
	});

	it('#getNext of an id', function() {
		var second = this.inst.$header.get(1);
		assert(this.inst.$header.get(2).id == this.inst.getNext(second.id).getId());
	});
});
describe('Header', function() {
	beforeEach(_beforeEachFn);
	var HeaderItem = $.yaaccordion.HeaderItem;
	it ('it has according el', function() {
		var self = this;
		this.inst.$header.each(function(index) {
			assert(this === self.$el.find('.accordion__header')[index]);
		});
	});

	it('"_name" property is set form options', function() {
		var $fixture = makeFixture({headerClass: 'accordion__myheader'});
		$fixture.yaaccordion({names: {header: 'myheader'}});
		var inst = $fixture.data('plugin_yaaccordion');
		assert(inst.first()._name = 'myheader');
	});

	it('if firstExpanded options is "true" first item is expanded', function() {
		var $fixture = makeFixture();
		$fixture.yaaccordion({firstExpanded: true});
		var inst = $fixture.data('plugin_yaaccordion');
		assert(inst.first().getState() === true);
	});

	it('has aria attrs', function() {
		var header = this.inst.first();
		var $el = header.$el;
		assert($el.attr('role') == 'tab');
		assert($el.attr('aria-expanded') == 'false');
		assert($el.attr('aria-selected') == 'false');
		assert(header.panel.$el[0].id = $el.attr('aria-controls'));
	});

	it('on header click it should toogle state', function() {
		var header = this.inst.first();
		var state = header.getState();
		header.$el.click();
		assert(header.getState() !== state);
	});

	it('#setId', function() {
		var $header = this.$el.find('.accordion__header');
		var obj = {$el: $header, options: {names: {header: 'header'}}};
		HeaderItem.prototype.setId.call(obj);
		assert(obj._id = 'yaac-h-0');
	});

	it('#getId', function() {
		var obj = {_id: 'id'};
		HeaderItem.prototype.getId.call(obj);
		assert(obj._id = 'id');
	});

	it('#_findPanelEl', function() {
		var $wrap = $('<div><div class="header"></div><div class="panel"></div></div>');
		var obj = {$el: $wrap.find('.header')};
		assert(HeaderItem.prototype._findPanelEl.call(obj)[0] == $wrap.find('.panel')[0]);
	});

	it('#toggle: expand', function() {
		var header = this.inst.first();
		header.toggle(true); // open
		assert(header.$el.attr('aria-expanded') == 'true');
		assert(header.$el.attr('aria-selected') == 'true');
		assert(header.getState() === true);
	});
	it('#toggle: close', function() {
		var header = this.inst.first();
		header.toggle(false); // open
		assert(header.$el.attr('aria-expanded') == 'false');
		assert(header.$el.attr('aria-selected') == 'false');
		assert(header.getState() === false);
	});
});

describe('Panel', function() {
	beforeEach(_beforeEachFn);
	it ('it has proper el', function() {
		var self = this;
		assert(this.inst.first().panel.$el[0] == this.$el.find('.accordion__panel')[0]);
	});

	it('#_setId: do not change id if it exists', function() {
		var $fixture = makeFixture({headerClass: 'accordion__myheader'});
		var $panel = $fixture.find('.accordion__panel').first();
		$panel.attr('id', 'myid');
		$fixture.yaaccordion({names: {header: 'myheader'}});
		var inst = $fixture.data('plugin_yaaccordion');
		assert(inst.first().panel.getId() == 'myid');
	});

	it('has area attrs', function() {
		var obj = initPlugin({}, {firstExpanded: false});
		var $panel = obj.$el.find('.accordion__panel').first();
		var id = obj.inst.first().$el[0].id;
		assert($panel.attr('labelledby', id));
		assert($panel.attr('role') == 'tabpanel');
		assert($panel.attr('aria-hidden') == 'false');
	});
});