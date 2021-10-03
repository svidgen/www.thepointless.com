class State {
	constructor(stateName) {
		return new Proxy({}, {
			get: function(NOT_USED, propName) {
				const o = localStorage.getItem(stateName) || {};
				return o[propName];
			},
			set: function(NOT_USED, propName, value) {
				const o = localStorage.getItem(stateName) || {};
				o[propName] = value;
				localStorage.setItem(stateName, o);
			}
		});
	}
}

module.exports = State;
