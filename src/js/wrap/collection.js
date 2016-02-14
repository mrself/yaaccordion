var Item = require('./item');
// var Header = 

function Module () {
	this.init = function() {
		var item = Item.init();

	};
}
Module.init = function($el, dName) {
	var inst = new Module()	;
	inst.$el = $el;
	inst.dName = dName;
	inst.init();
	return inst;
};
module.exports = Module;