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
	var $el = fixtureOptions.$el;
	if (!$el) {
		$el = makeFixture(fixtureOptions);
	}
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
	it('header is inited only once', function(done) {
		var $el = makeFixture({count: 4});
		var counter = 0;
		$el.on('expand.yaaccordion contract.yaaccordion', function() {
			counter++;
		});
		var obj = initPlugin({$el: $el}, {firstExpanded: false, slideDuration: 30});
		setTimeout(function() {
			assert(counter == 4, counter + ' times headers were inited');
			done();
		}, 31);
	});

	describe('keydown events', function() {
		it('next', function() {
			var e = $.Event('keydown');
			e.which = keyCodes.RIGHT;
			var tabbable = this.inst._tabbable;
			this.inst.$header.first().trigger(e);
			assert(this.inst.getNext(tabbable).getId() == this.inst._tabbable);
		});

		it('next twice', function() {
			var tabbable = this.inst._tabbable;
			var nextTabbable = this.inst.getNext(tabbable).getId();
			nextTabbable = this.inst.getNext(nextTabbable).getId();
			var e = $.Event('keydown');
			e.which = keyCodes.RIGHT;
			this.inst.$header.first().trigger(e);
			this.inst.$header.eq(1).trigger(e);
			assert(nextTabbable == this.inst._tabbable);
		});

		it('prev', function() {
			var tabbable = this.inst._tabbable;
			var e = $.Event('keydown');
			e.which = keyCodes.LEFT;
			this.inst.$header.first().trigger(e);
			assert(this.inst.getPrev(tabbable).getId() == this.inst._tabbable);
		});

		it('toggle on space / enter', function() {
			var header = this.inst.get(2);
			var state = header.getState();
			var e = $.Event('keydown');
			e.which = keyCodes.ENTER;
			header.$el.trigger(e);
			assert(header.getState() !== state);
		});

		it('home click on focus is on first header', function() {
			var firstHeader = this.inst.first();
			var e = $.Event('keydown');
			e.which = keyCodes.HOME;
			firstHeader.$el.trigger(e);
			assert(firstHeader.getId() == this.inst.getById(this.inst._tabbable).getId());
		});
		it('home click on focus is not on first header', function() {
			var header = this.inst.get(3);
			var e = $.Event('keydown');
			e.which = keyCodes.HOME;
			header.$el.trigger(e);
			assert(this.inst.first().getId() == this.inst.getById(this.inst._tabbable).getId());
		});

		it('end click when focus is on last header', function() {
			var header = this.inst.last();
			var e = $.Event('keydown');
			e.which = keyCodes.END;
			header.$el.trigger(e);
			assert(header.getId() == this.inst.getById(this.inst._tabbable).getId());
		});
		it('end click when focus is not on last header', function() {
			var header = this.inst.get(3);
			var e = $.Event('keydown');
			e.which = keyCodes.END;
			header.$el.trigger(e);
			assert(this.inst.last().getId() == this.inst.getById(this.inst._tabbable).getId());
		});

		describe('cntrl up/left', function() {
			it('when press control + up / left and focus is inside panel focus should go to management header', function() {
				var header = this.inst.get(3);
				var $link = $('<a href="#">Link</a>');
				var self = this;
				this.$el.on('expand.yaaccordion contract.yaaccordion', function(evt, _header) {
					if (_header.getId() == header.getId()) {
						assert(self.inst._tabbable == header.getId());
					}
				});
				header.panel.$el.append($link);
				var e = $.Event('keydown');
				e.which = keyCodes.UP;
				e.ctrlKey = true;
				header.$el.trigger('click');
				$link.trigger('focus');
				$link.trigger(e);
			});
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

	describe('tabindex = 0 in proper header element', function() {
		it('on init', function() {
			assert(this.$el.find('.accordion__header[tabindex=0]').length == 1);
		});

		it('on click on one of the header element', function(done) {
			var $el = makeFixture();
			$el.on('expand.yaaccordion', function(ev, item) {
				assert($el.find('.accordion__header[tabindex=0]')[0] === item.$el[0]);
				done();
			});
			var obj = initPlugin({$el: $el}, {firstExpanded: false});
			obj.inst.get(3).$el.trigger('click');
		});
		it('on click on three of the header element', function(done) {
			var $el = makeFixture();
			var counter = 0;
			$el.on('expand.yaaccordion', function(ev, item) {
				if (++counter == 3) {
					assert($el.find('.accordion__header[tabindex=0]')[0] === item.$el[0]);
					done();
				}
			});
			var obj = initPlugin({$el: $el}, {firstExpanded: false});
			obj.inst.get(3).$el.trigger('click');
			obj.inst.get(0).$el.trigger('click');
			obj.inst.get(1).$el.trigger('click');
		});
	});

	it('if header had "aria-expanded" property it should be expanded', function(done) {
		var $el = makeFixture();
		$el.find('.accordion__header').eq(3).attr('aria-expanded', true);
		var obj = initPlugin({$el: $el}, {firstExpanded: false});
		setTimeout(function() {
			assert(obj.inst.get(3).getState() == true);
			done()
		}, 1300)
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

	describe('click event', function() {
		it('on header click it should toogle state', function() {
			var header = this.inst.first();
			var state = header.getState();
			header.$el.click();
			assert(header.getState() !== state);
		});
		it('on header click _tabbable property should be changed to id of clicked header', function() {
			var header = this.inst.get(3);
			var self = this;
			this.$el.on('expand.yaaccordion contract.yaaccordion', function(evt, header) {
				assert(header.getId() === self.inst._tabbable);
			});
			header.$el.click();
		});
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
		assert($panel.attr('labelledby') == id);
		assert($panel.attr('role') == 'tabpanel');
		assert($panel.attr('aria-hidden') == 'false');
	});
});