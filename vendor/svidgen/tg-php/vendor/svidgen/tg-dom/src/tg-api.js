require('tg-namespace.js');
require('tg-upon.js');

TG.API.longPolls = TG.API.longPolls || [];
TG.API.requests = TG.API.requests || {};
TG.API.APIs = TG.API.APIs || [];

TG.replaceAll = function(s, map) {
	s = String(s);
	map.forEach(function(replacement) {
		s = s.replace(replacement[0], replacement[1]);
	});
	return s;
};

TG.addSlashes = function(s) {
	return TG.replaceAll(s, [
		[/\\/g, "\\\\"],
		[/\"/g, "\\\""],
		[/\'/g, "\\\'"],
	]);
	return s;
}; // TG.addSlashes()


TG.jsonEscape = function(s) {
	return TG.replaceAll(s, [
		[/\\/g, "\\\\"],
		[/\"/g, "\\\""],
		[/\//g, "\\/"],
		[/[\b]/g, "\\b"],
		[/\f/g, "\\f"],
		[/\n/g, "\\n"],
		[/\r/g, "\\r"],
		[/\t/g, "\\t"],
		[/[^\u0020-\u007d]/g, function(s) {
			return '\\u' + ('0000' + s.charCodeAt(0).toString(16)).slice(-4);
		}]
	]);
}; // TG.jsonEscape()


TG.jsonAddSlashes = function(s) {
	return TG.jsonEscape(s);
}; // TG.jsonAddSlashes()


TG.stringify = function (o, depth, stringify_instance, make_refs) {
	var d = typeof(depth) == 'number' ? depth : 128;
	if (d < 1) {
		return undefined;
	}

	var omissions = {
		__stringify_instance: 1,
		__parameters_imported: 1,
		__attributes_imported: 1,
		__AlreadyBound: 1,
	};

	var instance = stringify_instance || Math.random();
	if (o && o.__stringify_instance && o.__stringify_instance == instance) {
		delete o.__stringify_instance;
		return undefined;
	} else if (o) {
		o.__stringify_instance = instance;
	}

	var rv;

	if (typeof(o) === 'undefined') {
		rv = undefined;
	} else if (o === null) {
		rv = 'null';
	} else if (o instanceof Array) {
		var _rv = [];
		for (var i = 0; i < o.length; i++) {
			var v = TG.stringify(o[i], d - 1, instance, make_refs);
			if (v !== null) _rv.push(v);
		}
		rv = '[' + _rv.join(',') + ']';
	} else if (typeof(o) === 'boolean') {
		rv = o ? 'true' : 'false';
	} else if (make_refs && stringify_instance && isa(o, 'TG.DataObject')) {
		var _make_refs = false;
		rv = TG.stringify(
			new TG.DataObjectReference(o),
			d - 1,
			instance,
			_make_refs	
		);
	} else if (typeof(o) === 'object') {
		var _rv = [];
		for (var i in o) {
			if (!omissions[i] && o.hasOwnProperty(i) && !i.match(/__TG/)) {
				var v = TG.stringify(o[i], d - 1, instance, make_refs);
				var k = TG.stringify(i, d - 1, instance, make_refs);
				if (k && typeof(v) == 'string') {
					_rv.push(k + ':' + v);
				}
			}
		}
		rv = '{' + _rv.join(',') + '}';
	} else if (typeof(o) === 'number') {
		rv = String(o);
	} else if (typeof(o) === 'function') {
		// TODO: if the function is registered with Bind(), look for its
		// bound name(s) and put 'em here.
		rv = undefined;
	} else {
		rv = "\"" + TG.jsonEscape(o) + "\"";
	}

	if (o && o.__stringify_instance) {
		delete o.__stringify_instance;
	}

	return rv;
}; // TG.stringify()


TG.argumentsArray = function(args) {
	var rv = [];
	for (var i = 0; i < args.length; i++) {
		rv.push(args[i]);
	}
	return rv;
}; // TG.argumentsArray()


TG.API.multijsonp = function(api, actions, longpoll) {

	if (!TG.API.APIs[api]) {
		TG.API.APIs[api] = {};
	}

	upon(
		function() { return TG.API.poll; },
		function() {
			// prepare callback function
			var token_rand = Math.floor(100000 + Math.random() * 100000);
			var token_date = (new Date()).getTime();
			var token = token_date.toString(36) + token_rand.toString(36);

			TG.API.requests[token] = actions;
			TG.API.requests[token].longpoll = longpoll;

			// prepare request parameters; // upon()
			var actions_json = encodeURIComponent(TG.stringify(actions));

			var formdata;
			if (longpoll) {
				formdata = "tg-t=" + token + "&tg-w=" + actions_json;
			} else {
				formdata = "tg-t=" + token + "&tg-a=" + actions_json;
			}

			// send request
			var xml = window.MockXMLHttpRequest||window.XMLHttpRequest||null;
			var r = xml ? new xml() : new ActiveXObject("Microsoft.XMLHTTP");

			r.open('post', api, true);
			r.setRequestHeader(
				"Content-type", "application/x-www-form-urlencoded"
			);
			r.onreadystatechange = function() {
				if (r.readyState == 4) {
					if (r.status == 200) {
						eval(r.responseText);
					} else {
						console.log('TG.mulijsonp() Error or Abort', r);
					}
					delete TG.API.requests[token];
					if (longpoll) {
						delete TG.API.APIs[api].longPoll;
						if (r.status == 0 || r.responseText == '') {
							TG.API.disconnect(api, token);
						} else {
							TG.API.poll(api);
						}
					}
				}
			}
			r.send(formdata);

			if (longpoll) {
				TG.API.APIs[api].longPoll = r;
			}
		}
	);
	
}; // TG.multijsonp()


TG.API.jsonp = function(api, fn, params) {
	var cb = new TG.API.Callback();
	if (!(params instanceof Array)) { params = [params] }
	var action = {
		f: fn, p: params, c: cb
	};

	var j = TG.API.jsonp;
	j.pending = j.pending || {};

	var b = j.buffer;
	b[api] = b[api] || [];
	b[api].push(action);

	if (fn.match(/^tg-api/)) {
		// TG API control requests must fire immediately.
		TG.API.multijsonp(api, b[api]);
	} else if (typeof(j.pending[api]) == 'undefined') {
		j.pending[api] = setTimeout(function() {
			TG.API.multijsonp(api, b[api]);
			b[api] = [];
			delete j.pending[api];
		}, 15);
	}

	return cb;
}; // TG.jsonp()

TG.API.jsonp.buffer = {};

TG.API.getPolls = function(api, fn, params) {
	var rv = [];
	for (var i = 0; i < TG.API.longPolls.length; i++) {
		var p = TG.API.longPolls[i];
		if (p.api == api
			&& fn == null || p.f == fn
			&& params == null || p.p == params) {
			rv.push(p);
		}
	}
	return rv;
}; // TG.API.getPolls()

TG.API.poll = function(api) {
	var poll = TG.API.poll;
	poll.pending = poll.pending || {};
	if (typeof(poll.pending[api]) == 'undefined') {
		poll.pending[api] = setTimeout(function() {
			if (TG.API.APIs[api] && TG.API.APIs[api].longPoll) {
				TG.API.APIs[api].longPoll.abort();
			}

			var actions = TG.API.getPolls(api);

			if (actions.length == 0) {
				return;
			}

			TG.API.multijsonp(api, actions, true);

			delete poll.pending[api];
		}, 50);
	}
}; // TG.API.poll()

TG.API.restartPolls = function() {
	var t = TG.API;
	if (t.APIs) {
		for (var i = 0; i < t.APIs.length; i++) {
			var a = TG.API.APIs[i];
			if (t[a] && t[a].longPoll === undefined) {
				var acts = TG.API.getPolls(a);
				if (acts.length > 0) {
					if (t[a].longPollBroken) {
						console.log("Connection to " + a + " is broken. Retrying ...");
						TG.API.poll(a);
					} else {
						t[a].longPollBroken = true;
					}
				}
			} else if (t[a]) {
				t[a].longPollBroken = false;
			}
		}
	}
}; // restartPolls()

TG.API.poll.monitor = setInterval(TG.API.restartPolls, 5000);


TG.API.start = function(api, fn, params) {
	var existing = TG.API.getPolls(api, fn, params);
	if (existing.length > 0) {
		return;
	}

	var cb = new TG.API.Callback();
	var new_action = { 'api': api, 'f': fn, 'p': params, 'c': cb };
	cb.action = new_action;
	TG.API.longPolls.push(new_action);
	TG.API.poll(api);

	return cb;
}; // TG.APi.start()


TG.API.stop = function(t, i, m) {
	if (typeof(t) == 'object') {
		var to_remove = t;
		var m = m || i;
	} else {
		var to_remove = TG.API.requests[t][i];
	}

	var api = to_remove.api;

	if (m) {
		console.log(m);
	}

	var restart = false;
	if (TG.API.APIs[api] && TG.API.APIs[api].longPoll) {
		TG.API.APIs[api].longPoll.abort();

		// note to my future confused self -- this restarts the *general* poll
		// for the whole API, after removing the stop()ed fn().
		restart = true;
	}

	for (var i = 0; i < TG.API.longPolls.length; i++) {
		var p = TG.API.longPolls[i];
		if (p === to_remove) {
			delete p.c; // callback
			TG.API.longPolls.splice(i);
		}
	}

	if (restart) {
		TG.API.poll(api);
	}
}; // TG.API.stop()


TG.API.disconnect = function(api, t) {
	TG.API.jsonp(api, 'tg-api-disconnect', t);
}; // TG.API.disconnect()


TG.API.Callback = function() {

	var proxy = function(rv) {
		proxy.value.push(rv);
		doCallback();
	}; 

	setType(proxy, 'TG.API.Callback');

	proxy.returns = [];
	proxy.value = [];
	proxy.exception = null;
	proxy.chainlink = null;

	proxy.callback = function(fn) {
		proxy.chainlink = new TG.API.Callback();

		if (typeof(fn) === 'string') {
			var methodName = fn;
			var fn = function(p) {
				return p[methodName]();
			}
		}

		proxy.returns.push(fn);
		doCallback();
		return proxy.chainlink;
	};

	var doCallback = function() {
		if (proxy.value.length > 0) {
			var rv = proxy.value.shift();
			var returnToFn = proxy.returns[0];
			if (typeof(returnToFn) == 'function') {
				var rvToChain = returnToFn(rv);
				if (typeof(rvToChain) == 'function' && proxy.chainlink) {
					rvToChain.returnTo(proxy.chainlink);
				} else {
					// if a step in the chain simply returns a non-promise-like value,
					// forward the value down to the next chainlink immediately.
					proxy.chainlink(rvToChain);
				}
			}
		}
	}; // doCallback()

	proxy.stop = function() {
		if (proxy.action) {
			return TG.API.stop(proxy.action);
		}
		return null;
	};

	proxy.fail = function(e) {
		proxy.failure = e;
		if (typeof(proxy.failToFn) == 'function') {
			proxy.failToFn(e);
		}
		if (proxy.chainlink) {
			proxy.chainlink.fail(e);
		}
	};

	proxy.failTo = function(fn) {
		proxy.failToFn = fn;
		if (proxy.failure) {
			fn(proxy.failure);
		}
	};
	proxy.or = proxy.failTo;

	// callback() aliases.
	var r = ['returnTo','and'];
	for (var i = 0; i < r.length; i++) {
		proxy[r[i]] = proxy.callback;
	}


	// TODO? make .log() break the rules a little, so that it does not "consume"
	// a "step" in a returnTo() chain; but is more like an additional monitoring
	// option -- maybe introduce an additional monitor() or logTo() function?

	proxy.log = function() {
		proxy.returnTo(function(o) { console.log(o); });
	}; // log()

	proxy.logJSON = function() {
		proxy.returnTo(function(o) { console.log(TG.stringify(o)); });
	}; // logJSON()

	return proxy;

}; // TG.API.Callback()


TG.API.cb = function(t, i, rv) {
	if (TG.API.requests[t].longpoll) {
		if (rv === null || (typeof(rv.length) != 'undefined' && rv.length == 0)) {
			return;
		}
	}

	var o;
	if (rv === null) {
		o = null;
	} else if (typeof(rv) == 'object') {
		o = new rv.constructor;
	} else {
		o = rv;
	}
	TG.copy(rv, o);

	if (o && o['tg-api-error']) {
		var m = console.error || console.log;
		o.message = o['tg-api-error'];
		m(o['tg-api-error'] + "\n", o['tg-api-trace']);
		TG.API.requests[t][i].c.fail(o);
	} else {
		TG.API.requests[t][i].c(o);
	}

}; // TG.API.cb()


TG.API.alter = function(t, i, r) {
	TG.API.requests[t][i].p = r;
}; // TG.API.alter()


TG.findGlobal = function(s) {
	var parts = s.split('.');
	var rv = window;
	for (var i = 0; i < parts.length; i++) {
		var part = rv[parts[i]];
		if (part) {
			rv = part;
		} else {
			return null;
		}
	}
	return rv;
}; // TG.findGlobal()


TG.getTypeArray = function(ta_o) {
	var rv = [];
	for (var i in ta_o.__types) {
		rv.push(i);
	}
	rv.sort(function(a, b) {
		return ta_o.__types[a] > ta_o.__types[b];
	});
	return rv;
}; // TG.getTypeArray()


TG.applyTypesFrom = function(atf_source, atf_target) {
	var rv = null;

	if (
		atf_source !== null && atf_target !== null
		&& typeof(atf_target) === 'object'
		&& typeof(atf_source) === 'object'
		&& typeof(atf_source.__types) === 'object'
	) {

		var types = TG.getTypeArray(atf_source);

		for (var i = 0; i < types.length; i++) {
			var t = types[i];
			if (!isa(atf_target, t)) {
				var c = TG.findGlobal(t);
				if (typeof(c) == 'function') {
					rv = c.call(atf_target);
					if (rv) {
						atf_target = rv;
					}
				}
			}
		}
	}

	return rv;
}; // TG.applyTypesFrom()


TG.copy = function(cc_source, cc_target) {
	if (cc_source === null || typeof(cc_source) !== 'object'
		|| cc_target === null || typeof(cc_target) !== 'object'
	) {
		return;
	}

	var crv = TG.applyTypesFrom(cc_source, cc_target);

	var do_return = false;
	if (crv) {
		do_return = true;
	} else {
		crv = cc_target;
	}

	for (var i in cc_source) {
		if (i === '__types') {
			// ignore
		} else if (typeof(crv[i]) === 'function') {
			// ignore
		} else if (isa(cc_source[i], Array)) {
			if (!isa(crv[i], Array)) {
				crv[i] = cc_source[i];
			}
			for (var ai = 0; ai < crv[i].length; ai++) {
				TG.copy(cc_source[i][ai], crv[i][ai]);
			}	
		} else if (typeof(cc_source[i]) === 'object') {
			if (typeof(crv[i]) !== 'object') {
				crv[i] = {};
			}
			var inner_crv = TG.copy(cc_source[i], crv[i]);
			if (inner_crv) {
				crv[i] = inner_crv;
			}
		} else if (typeof(crv[i]) !== 'object') {
			// a scalar, presumably
			crv[i] = cc_source[i];
		}
	}

	if (do_return) {
		return crv;
	}
}; // TG.copy()


TG.FunctionReference = function() {
	var rv = function() {
		var method;
		var runner = rv.isEvent ? TG.API.start : TG.API.jsonp;
		var args = TG.argumentsArray(arguments);
		for (var i in this) {
			if (this[i] === rv) {
				method = rv.target;
				break;
			}
		}
		return runner(
			rv.api,
			method,
			args
		);
	};
	setType(rv, 'TG.FunctionReference');
	return rv;
}; // TG.FunctionReference()


TG.Value = function(v) {
	var value = undefined;

	this.valueOf = function() {
		return value;
	}; // valueOf()

	this.set = function(v) {
		value = v;
		on(this, 'change').fire();
	}; // set()

	if (v) {
		this.set(v);
	}

	setType(this, 'TG.Value');
}; // TG.Value()
