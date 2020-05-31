require('tg-observe.js');
require('tg-upon.js');

TG.Event = function (singleFire, o, a) {

	this.target = o;
	this.action = a;
	this.subscribers = [];
	this.interceptors = [];
	this.fired = 0;
	this.singleFire = singleFire || false;
	this.args = [];

	this.register = function (fn) {
		if (this.singleFire && this.fired > 0) {
			fn();
		} else {
			this.subscribers.push(fn);
		}
		return this;
	}; // register()

	this.then = this.register;
	this.and = this.then;

	this.fire = function (arg1, arg2, etc) {
		this.args = arguments;
		this.fireWithInterception();
		this.fired += 1;
		return this;
	}; // fire()

	this.fireOnce = function(arg1, arg2, etc) {
		this.singleFire = true;
		return this.fire.apply(this, arguments);
	}; // fireOnce()

	this.fireWithInterception = function (i) {
		var i = i || 0;

		if (typeof (this.interceptors[i]) == 'function') {
			var _t = this;
			this.interceptors[i]({
			    /* include other/all properties of _t as necessary */
                arguments: _t.args,
				resume: function () {
				    _t.fireWithInterception(i + 1);
				}
			});
			return;
		}

		this.fired += 1;
		var firedFns = [];

		while (this.subscribers.length > 0) {
			var fn = this.subscribers.pop();
			if (typeof(fn) !== 'function') continue;
			fn.apply(null, this.args);
			firedFns.push(fn);
		}

		if (!this.singleFire) {
			this.subscribers = firedFns;
		}
	}; // fire()

	this.intercept = function (fn) {
		if (typeof (fn) === 'function') {
			this.interceptors.push(fn);
		}
	}; // intercept()

	setType(this, 'TG.Event');
}; // TG.Event()

TG.Event.events = [];
TG.Event.events.getWaiting = function () {
	return TG.Event.events.filter(function (e) { return e.fired == 0; });
};

TG.Event.registries = [];
TG.Event.registries.getWaiting = function () {
	return (TG.Event.registries
		.filter(function (r) { return r.fired < r.count; })
	);
};

this.on = function (o, a, f, sf) {
	var eventName = "__TGEvent_on" + a;

	var singleFire = sf || false;

	// todo: add other enumerable types:
	if (isa(o, Array) || isa(o, NodeList)) {
		var _o = [];
		for (var i = 0; i < o.length; i++) {
			if (isa(o[i], Object) && (isa(o[i], Element) || !isa(o[i], Node))) {
				_o.push(o[i]);
			}
		}
		var registry = {
			count: _o.length,
			fired: 0,
			fn: f,
			singleFire: singleFire,
			fire: function () {
				this.fired++;
				if (this.fired >= this.count) {
					on(this, 'complete').fire();
				}
			},

			// for debugging and/or monitoring
			objects: _o,
			eventName: eventName
		};

		if (_o.length > 0) {
			for (var i = 0; i < _o.length; i++) {
				on(_o[i], a, function () { registry.fire(); }, singleFire);
			}
		} else {
			registry.fire();
		}

		TG.Event.registries.push(registry);
		return on(registry, 'complete');
	}

	if (typeof (o[eventName]) === 'undefined') {
		o[eventName] = new TG.Event(singleFire, o, eventName);
	} else if (!isa(o[eventName], 'TG.Event')) {
		throw eventName + " already exists as a non-TG.Event on the target object.";
	}

	if (typeof(f) == 'function') {
		o[eventName].register(f);
	}

	return o[eventName];
};
// on()

this.onready = function (o, f) {
	return on(o, 'ready', f, true);
};
// onready()


