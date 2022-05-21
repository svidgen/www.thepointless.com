class State {
	constructor(stateName = 'global') {
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
		const query = new URL(location).searchParams;

		try {
			const repr = query.get(name);
			return JSON.parse(atob(repr)) || {};
		} catch {
			return {};
		}
	}

	static set(name, o) {
		const url = new URL(location);
		const repr = btoa(JSON.stringify(o));
		url.searchParams.set(name, repr);
		const s = url.toString();
		history.pushState(s, '', s);
	}
}

module.exports = State;
