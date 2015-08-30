function l(x) {
	console.log(x);
}
var $fixture = $('#qunit-fixture');
var fixureAccordion = $('<div />', {
	class: 'accordion'
});
fixureAccordion.append($('<div />', {
	class: 'accordion__header'
}));
fixureAccordion.append($('<div />', {
	class: 'accordion__panel'
}));
function makeFixture(options) {
	var defaults = {
		header: null,
		panel: null,
		withItem: false,
		name: 'accordion',
		number: 3
	};
	options = $.extend(true, defaults, options);
	var $result = $([]);
	for (var i = 0; i < options.number; i++) {
		var $item;
		if (options.withItem) {
			$item = $('.'+ options.name +'__item');
		} else {
			$item = $([]);
		}
		if (options.header instanceof $) {
			$item = $item.add(options.header.clone());
		} else if (options.header === null) {
			$item = $item.add($('<div />', {
				class: options.name + '__header',
				text: 'header = ' + i
			}));
		} else {
			$item = $item.add($('<div />', {
				class: options.header,
				text: 'header = ' + i
			}));
		}

		if (options.panel instanceof $) {
			$item = $item.add(options.panel.clone());
		} else if (options.panel === null) {
			$item = $item.add($('<div />', {
				class: options.name + '__panel',
				text: 'panel = ' + i
			}));
		} else {
			$item = $item.add($('<div />', {
				class: options.panel,
				text: 'panel = ' + i
			}));
		}

		$result = $result.add($item);
		
	}
	return $('<div />', {
		class: options.name,
		html: $result
	});
}
QUnit.test('plugin defined in jq', function() {
	ok(typeof $.fn.yaaccordion == 'function', 'plugin defined in prototype');
	ok(typeof $.yaaccordion == 'function', 'plugin is defined as static property');
});
QUnit.test('construct', function() {
	var $accordion = fixureAccordion.clone();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok(pluginObj && pluginObj instanceof $.yaaccordion, 'plugin is inited and data is set to el');
	ok(pluginObj.el == $accordion.get(0), 'el is defined');
	ok(pluginObj.$el.length > 0, 'jquery el is defined');
});
QUnit.test('init', function() {
	var $accordion = fixureAccordion.clone();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok(pluginObj.selector == '.accordion', 'proper selector');
});
QUnit.module('wrap');
QUnit.test('make wrap when options makeWrap enabled', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion({
		makeWrap: true,
		number: 3
	});
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok($accordion.find('.accordion__wrap').length == 3);
	ok(pluginObj.e.wrap.items.length, 'wrap exists in class');
});
QUnit.test('make wrap when options makeWrap disabled', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion({
		makeWrap: false,
	});
	ok(!$accordion.find('.accordion__wrap').length, 'wrap exists in html');
});

QUnit.module('header', {});
QUnit.test('classes and selectors', function() {
	var $accordion = makeFixture({
		header: $('<h3 />', {
			text: 'blabla'
		}),
		name: 'accordion'
	});
	$fixture.append($accordion);
	$accordion.yaaccordion({
		header: {
			selector: 'h3'
		}
	});
	var pluginObj = $accordion.data('plugin_yaaccordion');
	valid = true;
	pluginObj.e.header.$el.each(function(index, el) {
		valid = valid && $(this).hasClass('accordion__header');
	});
	ok(valid, 'header $el has proper class');
	ok(pluginObj.e.header.dName == 'accordion__header', 'collection obj has proper dName');
});
QUnit.test('events', function(assert) {
	var done = assert.async();
	var done2 = assert.async();
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var $header = $accordion.find('.accordion__header').first();
	function checkOnChange() {
		ok($header.attr('tabindex') == 0, 'tabindex == 0');
		$accordion.find('.accordion__header').slice(1).each(function(index, el) {
			ok($(this).attr('tabindex') == -1);
			// ok($header.is(':focus'), 'header has focus');
		});
	}
	$header.on('expand.yaaccordion', function() {
		ok($header.hasClass('accordion__header--expanded'), 'header has expand mod on expand');
		checkOnChange();
		done();
	});
	$header.on('collapse.yaaccordion', function() {
		ok(!$header.hasClass('accordion__header--expanded'), 'header has no expand mod on collapse');
		checkOnChange();
		done2();
	});
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok(pluginObj.e.header.makeEventName('expand') == 'expand.yaaccordion', 'valid event name');
	$header.trigger('expand.yaaccordion');
	$header.trigger('collapse.yaaccordion');
});
QUnit.test('multiselectable option enabled', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.find('.accordion__header').data('yaaccordion', {expanded: true});
	$accordion.yaaccordion({
		multiselectable: true
	});
	var pluginObj = $accordion.data('plugin_yaaccordion');
	var valid = true;
	$.each(pluginObj.e.header.items, function(index, val) {
		if (!val.expanded) valid = false;
	});
	ok(valid);
});
QUnit.test('multiselectable option disabled', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion({
		multiselectable: false
	});
	var pluginObj = $accordion.data('plugin_yaaccordion');
	var valid = pluginObj.e.header.items[0].expanded;
	$.each(pluginObj.e.header.items.slice(1), function(index, val) {
		if (val.expanded) valid = false;
	});
	ok(valid);
});

QUnit.test('find panel', function() {
	var $accordion = makeFixture({
		panel: $('<div />', {
			text: 'blabla',
			class: 'panel'
		}),
		name: 'accordion'
	});
	$fixture.append($accordion);
	$accordion.yaaccordion({
		panel: {
			selector: 'panel'
		}
	});
	var pluginObj = $accordion.data('plugin_yaaccordion');
	var header = pluginObj.e.header.items[0];
	ok(header.panel.$el.length == 1 && header.findPanel()[0] == $accordion.find('.panel')[0]);
});

QUnit.test('data options', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	 $accordion.find('.accordion__header').first().data('yaaccordion', {expanded: true});
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	var header = pluginObj.e.header.items[0];
	ok(header.dataOptions.expanded);
});
QUnit.test('aria', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	var $header = $accordion.find('.accordion__header').first();
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok($header.attr('tabindex') !== undefined);
	ok($header.hasRole('tab'));
});
QUnit.test('insert id if not exists', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok($accordion.find('.accordion__header')[0].id.indexOf('yaac-h-') === 0);
});
QUnit.test('not insert id if it exists', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	var $header = $accordion.find('.accordion__header');
	$header[0].id = 'blabla';
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok($header[0].id == 'blabla');
});
QUnit.test('expand first header when no header is expanded by option', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	var $header = $accordion.find('.accordion__header');
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok($header[0] == pluginObj.e.header.active.$el[0]);
});
QUnit.test('not expand first header when active header is expanded by option', function() {
	var $accordion = makeFixture({
		number:3
	});
	$fixture.append($accordion);
	var $header = $accordion.find('.accordion__header');
	$header.last().data('yaaccordion', {expanded: true});
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok($header.last()[0] == pluginObj.e.header.active.$el[0]);
	ok(!pluginObj.e.header.items[0].expanded && !pluginObj.e.header.items[1].expanded);
});

QUnit.module('panel');
QUnit.test('selectors', function() {
	var $accordion = makeFixture({
		panel: $('<div />', {
			text: 'blabla'
		}),
		name: 'accordion'
	});
	$fixture.append($accordion);
	$accordion.yaaccordion({
		makeWrap: true
	});
	var pluginObj = $accordion.data('plugin_yaaccordion');
	valid = true;
	pluginObj.e.panel.$el.each(function(index, el) {
		valid = valid && $(this).hasClass('accordion__panel');
	});
	ok(valid, 'panel $el has proper class');
	ok(pluginObj.e.panel.dName == 'accordion__panel', 'collection obj has proper dName');
});
QUnit.test('events', function(assert) {
	assert.expect(2);
	var done = assert.async();
	var done2 = assert.async();
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var $header = $accordion.find('.accordion__header').first();
	var $panel = $accordion.find('.accordion__panel').first();
	var flag = false;
	$header.on('expand.yaaccordion', function() {
		ok($panel.hasClass('accordion__panel--expanded'), 'header has expand mod on expand');
		done();
	});
	$header.on('collapse.yaaccordion', function() {
		ok(!$panel.hasClass('accordion__panel--expanded'), 'header has no expand mod on collapse');
		done2();
	});
	
	$header.trigger('expand.yaaccordion');
	$header.trigger('collapse.yaaccordion');
});
QUnit.test('is expanded when header has option expanded', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	var $header = $accordion.find('.accordion__header').first();
	$header.data('yaaccordion', {expanded: true});
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok(pluginObj.e.panel.items[0].hasMod('expanded'));
});
/* First item is active by defalt, so it does not have sence */
QUnit.test('is not expanded when header has not option expanded', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	ok(!pluginObj.e.panel.items[1].hasMod('expanded') || !pluginObj.e.panel.items[2].hasMod('expanded'));
});

QUnit.module('accordion events');
QUnit.test('next', function(assert) {
	var $accordion = makeFixture();
	var done = assert.async();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	$accordion.find('.accordion__header').first().trigger('expand.yaaccordion');
	$accordion.on('next.yaaccordion', function() {
		ok($accordion.find('.accordion__header').eq(1).aria('expanded') === 'true');
		done();
	});
	$accordion.trigger('next.yaaccordion');
});
QUnit.test('prev', function(assert) {
	var $accordion = makeFixture({
		number: 3
	});
	var done = assert.async();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	$accordion.find('.accordion__header').last().trigger('expand.yaaccordion');
	$accordion.on('prev.yaaccordion', function() {
		ok($accordion.find('.accordion__header').eq(1).aria('expanded') === 'true');
		done();
	});
	$accordion.trigger('prev.yaaccordion');
});
QUnit.test('first', function(assert) {
	var $accordion = makeFixture({
		number: 3
	});
	var done = assert.async();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	$accordion.find('.accordion__header').last().trigger('expand.yaaccordion');
	$accordion.on('first.yaaccordion', function() {
		ok($accordion.find('.accordion__header').first().aria('expanded') === 'true');
		done();
	});
	$accordion.trigger('first.yaaccordion');
});
QUnit.test('last', function(assert) {
	var $accordion = makeFixture({
		number: 3
	});
	var done = assert.async();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	$accordion.find('.accordion__header').first().trigger('expand.yaaccordion');
	$accordion.on('last.yaaccordion', function() {
		ok($accordion.find('.accordion__header').last().aria('expanded') === 'true');
		done();
	});
	$accordion.trigger('last.yaaccordion');
});

QUnit.module('destroy');
QUnit.test('header', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	var $header = $accordion.find('.accordion__header');
	pluginObj.destroy();
	$header.each(function(index, el) {
		ok($(this).attr('role') === undefined);
		ok($(this).attr('aria-controls') === undefined);
		ok($(this).attr('tabindex') === undefined);
		ok(!$(this).hasClass('accordion__header'));
		ok(!$(this).hasClass('accordion__header--expanded'));
		ok(!$._data(this, "events"));
	});

});

QUnit.test('panel', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	var $panel = $accordion.find('.accordion__panel');
	pluginObj.destroy();
	$panel.each(function(index, el) {
		ok($(this).attr('role') === undefined);
		ok($(this).attr('aria-labelledby') === undefined);
		ok(!$(this).hasClass('accordion__panel'));
		ok(!$(this).hasClass('accordion__panel--expanded'));
		ok(!$._data(this, "events"));
	});
});

QUnit.test('general', function() {
	var $accordion = makeFixture();
	$fixture.append($accordion);
	$accordion.yaaccordion();
	var pluginObj = $accordion.data('plugin_yaaccordion');
	var $panel = $accordion.find('.accordion__panel');
	pluginObj.destroy();
	ok($accordion.attr('role') === undefined);
	ok($accordion.attr('aria-multiselectable') === undefined);
	var flag = false;
	$accordion.on('test', function() {
		flag = true;
	});
	var events = $._data($('.accordion')[0], "events");
	ok(!$._data(this, "events") || (Object.keys(events).length == 1) && events.test !== undefined);
	ok(!$accordion.data('plugin_yaaccordion'));
});
