class State {
	constructor(stateName = 'tpdc.global') {
		return new Proxy({}, {
			get: function(NOT_USED, propName) {
				const o = State.get(stateName);
				return o[propName];
			},
			set: function(NOT_USED, propName, value) {
				const o = State.get(stateName);
				o[propName] = value;
				State.set(stateName, o);
			}
		});
	}

	static get(name) {
		const json = localStorage.getItem(name) || '{}';
		try {
			return JSON.parse(json);
		} catch {
			return {};
		}
	}

	static set(name, o) {
		localStorage.setItem(name, JSON.stringify(o));
	}
}

module.exports = State;
