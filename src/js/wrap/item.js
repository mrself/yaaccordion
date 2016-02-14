var Header = require('../header');

function Module () {
	this.init = function() {
		this.header
	};
}
Module.init = function($el, dName) {
	var inst = new Module();
	inst.dName = dName;
	inst.init();
	return inst;
};
module.exports = Module;