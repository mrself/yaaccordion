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