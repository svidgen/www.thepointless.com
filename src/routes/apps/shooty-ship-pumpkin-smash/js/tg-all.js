//
// Copyright (c) 2013 http://www.trulygui.com/
//
// Provided as is, without warranty of any kind. This IS
// a work in progress. So, it's probaby buggy.
//
// Use it and abuse it however you like. But, if you'd be
// so kind, leave this notice in tact and don't hotlink!
//
// Jon Wire
// http://www.linkedin.com/in/jonwire
//

var upon = function(test, fn) {
	if (typeof(test) == 'function' && test()) {
		fn();
	} else if (typeof(test) == 'string' && global[test]) {
		fn();
	} else {
		setTimeout(function() { upon(test, fn); }, 50);
	}
}; // upon()

//
// Class binding
//
// allows us to select namespaced nodes in a cross-browser
// compliant manner.

var TG = TG || {};

global.console = global.console || {
	log_items: [],
	log: function () {
		for (var i = 0; i < arguments.length; i++) {
			this.log_items.push(arguments[i]);
		}
	}
} // console


Element = global.Element || function () { return true; };
Node = global.Node || global.Element;


var setType = function (o, constructor) {
	o.__types = o.__types || {};

	var t = constructor;
	if (typeof(t) == 'function') {
		t = t.name;
	}

	if (t) {
		var v = 0;
		for (var i in o.__types) {
			v = Math.max(v, o.__types[i]);
		}
		v += 1;
		o.__types[t] = v;
	}
}; // setType()


var isa = function (o, constructor) {
	try {
		if (typeof(constructor) === 'string') {
			o.__types = o.__types || {};
			if (constructor && o.__types[constructor]) {
				return true;
			}
		}
	} catch (e) {
		// TODO: desupport IE8 and determine whether this (or something like it)
		// is necessary for IE>8
	
		// IE8 apparently throws a fit of this happens to be a text node.
		// ... not entirely sure what to do about that.
		if (global.Text && o instanceof Text) {
			if (constructor == Element || constructor == Node) {
				return true;
			}
		}
	}

	if (constructor === Element || constructor === Node || typeof(constructor) === 'function') {
		if (typeof(o) == 'string' && constructor === String) {
			return true;
		}
		if (typeof(o) == 'number' && constructor === Number) {
			return true;
		}
		return o instanceof constructor;
	} else {
		return o === constructor;
	}
}; // isa()


TG.Event = function (singleFire) {

	this.fns = [];
	this.fired = 0;
	this.singleFire = singleFire || false;
	this.args = [];

	this.register = function (fn) {
		if (this.singleFire && this.fired > 0) {
			fn.apply(null, this.args);
		} else {
			this.fns.push(fn);
		}
	}; // register()

	this.fire = function (arg1, arg2, etc) {
		this.fired += 1;
		var firedFns = [];
		this.args = arguments;
		
		while (this.fns.length > 0) {
			var fn = this.fns.pop();
			fn.apply(null, this.args);
			firedFns.push(fn);
		}

		if (!this.singleFire) {
			this.fns = firedFns;
		}
	}; // fire()

	setType(this, 'TG.Event');
};
// TG.Event()


var on = function (o, a, f, sf) {
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
			objects: _o,    /* for debugging */
			count: _o.length,
			fired: 0,
			fn: f,
			fire: function () {
				this.fired++;
				if (this.fired >= this.count) {
					f();
				}
			}
		};

		if (_o.length > 0) {
			for (var i = 0; i < _o.length; i++) {
				on(_o[i], a, function () { registry.fire(); }, singleFire);
			}
		} else {
			registry.fire();
		}

		return registry;
	}

	var fns = [];

	if (typeof (o[eventName]) === 'undefined') {
		o[eventName] = new TG.Event(singleFire);
	} else if (typeof (o[eventName]) == 'function' && !isa(o[eventName], 'TG.Event')) {
		fns.push(o[eventName]);
		o[eventName] = new TG.Event(singleFire);
	} else if (isa(o[eventName], Array)) {
		fns = fns.concat(o[eventName]);
	}

	if (isa(o[eventName], 'TG.Event')) {
		if (f) {
			fns.push(f);
		}
		for (var i = 0; i < fns.length; i++) {
			o[eventName].register(fns[i]);
		}
	}

	return o[eventName];
};
// onready()


var onready = function (o, f) {
	return on(o, 'ready', f, true);
};
// onready()


var StringSet = function(v) {
	var _d = {};
	
	this.add = function(v) {
		if (v instanceof Array) {
			for (var i = 0; i < v.length; i++) {
				this.add(v[i]);
			}
		} else {
			_d[v] = true;
		}
	}; // add()

	this.remove = function(v) {
		delete _d[v];
	}; // remove()

	this.toArray = function() {
		var rv = [];
		for (var i in _d) {
			rv.push(i);
		}
		return rv;
	}; // toArray()

	if (v) {
		this.add(v);
	}
}; // StringSet


var getClassnames = function(node) {
	return (new StringSet(node.className.split(/\s+/))).toArray();
}; // getClassnames()


var addClassname = function(node, classname) {
	var classes = new StringSet(node.className.split(/\s+/));
	classes.add(classname);
	node.className = classes.toArray().join(' ');
}; // addClassname()


var removeClassname = function(node, classname) {
	var classes = new StringSet(node.className.split(/\s+/));
	classes.remove(classname);
	node.className = classes.toArray().join(' ');
}; // removeClassname()


var currentStyle = function(node, key) {
	return node.currentStyle ? node.currentStyle[key]
		: document.defaultView.getComputedStyle(node, '')[key];
}; // currentStyle()


var copyStyle = function(f, t, asComputed) {
	if (asComputed instanceof Array) {
		for (var i = 0; i < asComputed.length; i++) {
			t.style[asComputed[i]] = currentStyle(f, asComputed[i]);
		}
	} else {
		for (var i in f.style) {
			t.style[i] = asComputed ? currentStyle(f, i) : f.style[i];
		}
	}
	var c = getClassnames(f);
	for (var i = 0; i < c.length; i++) {
		addClassname(t, c[i]);
	}
}; // getStyles()


if (!Bind) {

	var Bind = function (constructor, binding, scope) {
		if (typeof (constructor) == 'function') {
			Bind.addBinding(constructor, binding);
			var nodes = getNodes(isa(scope, Node) ? scope : document, binding);
			if (nodes) {
				for (var i = 0; i < nodes.length; i++) {
					var nodes_bound = 0;
					if (!nodes[i].__AlreadyBound) {
						if (constructor.templateMarkup) {
							Bind.importParameters(nodes[i]);
							nodes[i].innerHTML = constructor.templateMarkup;
							Bind(nodes[i]);
						}
						Bind.importIdentifiedChildren(
							nodes[i], nodes[i].childNodes, 1
						);
						Bind.exportParameters(nodes[i]);
						constructor.apply(nodes[i]);
						typeof(nodes[i].init) == 'function' && nodes[i].init();
						nodes[i].__AlreadyBound = true;
						nodes_bound++;
					}
				}
				if (nodes_bound > 0) {
					console.log("Bound " + nodes.length + " " + binding + " nodes.");
				}
			}
		} else if (isa(constructor, Node)) {
			var n = constructor;
			for (var binding in Bind.Classes) {
				Bind(Bind.Classes[binding], binding, n);
			}
		}
	}; // Bind()


	Bind.Classes = {};


	Bind.originalCreateElement = document.createElement;
	document.createElement = function (tag, o) {
		var _o = o || {};
		var constructor = Bind.getConstructor(tag);
		if (constructor) {

			var container = Bind.originalCreateElement.call(this, 'div');
			var node;

			if (tag.indexOf(':') >= 0) {
				container.innerHTML = '<' + tag + '></' + tag + '>';
				node = container.firstChild;
			} else {
				container.className = tag;
				node = container;
			}

			for (var i in _o) {
				node[i] = _o[i];
			}

			if (constructor.templateMarkup) {
				node.innerHTML = constructor.templateMarkup;
				Bind.importIdentifiedChildren(node, node.childNodes, 1);
			}

			Bind.exportParameters(node);

			constructor.apply(node);
			typeof(node.init) == 'function' && node.init();
			Bind(node);		// (re)bind all registered classes

		} else {
			var node = Bind.originalCreateElement.call(this, tag);
			for (var i in _o) {
				node[i] = _o[i];
			}
		}
		return node;
	}; // document.createElement()


	Bind.addBinding = function(constructor, binding) {
		Bind.Classes[binding] = constructor;
	}; // addBinding()


	Bind.getConstructor = function(binding) {
		return Bind.Classes[binding];
	}; // getConstructor()


	Bind.getBindings = function (constructor) {
		var rv = [];
		for (var i in Bind.Classes) {
			if (Bind.Classes[i] == constructor) {
				rv.push(i);
			}
		}
		return rv;
	}; // getBindings()


	Bind.importIdentifiedChildren = function (obj, nodes, databinding) {
		for (var i = 0; i < nodes.length; i++) {
			// skip Text nodes
			if (!nodes[i].getAttribute) continue;

			// attach nodes with a data-id to the object ... obj.{data-id}
			var id = nodes[i].getAttribute('data-id');
			if (id) {
				if (databinding && obj[id]) {
					if (isa(obj[id], Node)) {
						nodes[i].parentNode.replaceChild(
							obj[id], nodes[i]
						);
					} else {
						nodes[i].innerHTML = obj[id];
						obj[id] = nodes[i];
					}
				} else {
					obj[id] = nodes[i];
				}
			}

			if (!nodes[i].__AlreadyBound) {
				Bind.importIdentifiedChildren(
					obj, nodes[i].childNodes,databinding
				);
			}
		}
	}; // Bind.importIdentifiedChildren()


	Bind.importAttributes = function (o, node) {
		var node = node || o;
		if (!o.__attributes_imported
			&& node.attributes && node.attributes.length
		) {
			for (var i = 0; i < node.attributes.length; i++) {
				var a = node.attributes[i];
				if (!o[a.name]) {
					o[a.name] = a.value;
				}
			}
		}
		o.__attributes_imported = true;
	}; // importAttributes()


	Bind.importParameters = function (o, node) {
		var node = node || o;
		if (!o.__parameters_imported && node.childNodes) {
			o.parameters = [];

			for (var i = 0; i < node.childNodes.length; i++) {
				var n = node.childNodes[i];

				if (n.nodeType && n.nodeType == 3 && n.data && n.data.replace(/\s/g, '')) {
					// special treatment for IE 8 text nodes
					var _n = document.createElement('span');
					_n.innerHTML = n.data;
					n = _n;
				} else {
					Bind.importAttributes(n);
				}
				o.parameters.push(n);
			}

			//
			// fix for IE
			o.__holdingDiv = document.createElement('div');
			o.__holdingDiv.style.display = 'none';
			document.body.appendChild(o.__holdingDiv);
			for (var i = 0; i < o.parameters.length; i++) {
				o.__holdingDiv.appendChild(o.parameters[i]);
			}
			//

			// not 100% sure why parameters aren't being bound
			// during the regular Bind() calls, but in some cases they're not:
			Bind(o.__holdingDiv);
		}
		o.__parameters_imported = true;
	}; // importParameters()


	Bind.exportParameters = function (o, node) {
		if (!o.parameters || !isa(o.parameters, Array)) { return; }
		var node = node || o;

		for (var i = 0; i < o.parameters.length; i++) {
			var p = o.parameters[i];
			var id = p['data-id'];
			if (id) {
				if (node[id] && isa(node[id], Node) && isa(p, Node)) {
					node[id].parentNode.replaceChild(p, node[id]);
					node[id] = p;
				}
			}
		}

		var hd = o.__holdingDiv;
		if (hd && hd.childNodes && hd.childNodes.length == 0) {
			hd.parentNode.removeChild(hd);
			delete o.__holdingDiv;
		}
	}; // exportParameters()


	Bind.getChildren = function (o, query) {
		if (!o.childNodes) {
			return [];
		}

		var rv = [];

		// not necessarily the most efficient solution. but an easy one!
		var _rv = getNodes(o, query);
		for (var i = 0; i < _rv.length; i++) {
			if (_rv[i].parentNode === o) {
				rv.push(_rv[i]);
			}
		}

		return rv;
	}; // getChildren()


	Bind.Box = function(x, y, w, h, mt, mr, mb, ml) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = w || 0;
		this.height = h || 0;
		this.marginTop = mt || 0;
		this.marginRight = mr || 0;
		this.marginBottom = mb || 0;
		this.marginLeft = ml || 0;

		this.contains = function(x, y) {
			var ex = this.x - Math.ceil(this.marginLeft/2);
			var ey = this.y - Math.ceil(this.marginTop/2);
			var eright = this.x + this.width - Math.ceil(this.marginRight/2);
			var ebottom = this.y + this.height - Math.ceil(this.marginBottom/2);
			if (x >= ex && x <= eright && y >= ey && y <= ebottom) {
				return true;
			} else {
				return false;
			}
		}; // contains()

		this.getBottom = function() {
			return this.y + this.height;
		}; // getCorners()

		this.getRight = function() {
			return this.x + this.width;
		}; // getCorners()

		this.rangeOverlaps = function(aMin, aMax, bMin, bMax) {
			return aMin <= bMax && bMin <= aMax;
		}; // lineOverlaps()

		this.xOverlaps = function(box) {
			return this.rangeOverlaps(
				this.x, this.getRight(), box.x, box.getRight()
			);
		}; // xOverlaps()

		this.yOverlaps = function(box) {
			return this.rangeOverlaps(
				this.y, this.getBottom(), box.y, box.getBottom()
			);
		}; // yOverlaps()

		this.overlaps = function(box) {
			return this.xOverlaps(box) && this.yOverlaps(box);
		}; // overlaps()

	}; // Bind.Box()


	Bind.NodeBox = function(n) {
		this.x = n.offsetLeft;
		this.y = n.offsetTop;

		var temp = n;
		while (temp = temp.offsetParent) {
			this.x += temp.offsetLeft;
			this.y += temp.offsetTop;
		}

		this.left = this.x;
		this.top = this.y;
		this.width = n.offsetWidth;
		this.height = n.offsetHeight;
		this.right = this.x + this.width;
		this.bottom = this.x + this.height;

		var style = {
			marginLeft: '', marginRight: '', marginTop: '', marginBottom: ''
		};

		this.marginLeft = parseInt(style.marginLeft.replace(/[^0-9]/g, '') || '0');
		this.marginRight = parseInt(style.marginRight.replace(/[^0-9]/g, '') || '0');
		this.marginTop = parseInt(style.marginTop.replace(/[^0-9]/g, '') || '0');
		this.marginBottom = parseInt(style.marginBottom.replace(/[^0-9]/g, '') || '0');
	}; // getCoordinates()
	Bind.NodeBox.prototype = new Bind.Box();


	// TG.MouseCoords
	// Determines and stores the Coordinates for a mouse event
	TG.MouseCoords = function (event) {
		var e = event || global.event;
		if (e.changedTouches) {
			this.x = e.changedTouches[0].pageX;
			this.y = e.changedTouches[0].pageY;
		} else if (e.pageX || e.pageY) {
			this.x = e.pageX;
			this.y = e.pageY;
		} else if (e.clientX || e.clientY) {
			this.x = e.clientX + document.body.scrollLeft;
			this.y = e.clientY + document.body.scrollTop;
		}
	}; // TG.MouseCoords


	global.getNodes = global.getNodes || function (n, q) {
		var rv;

		if (typeof (q) == 'function' && global.Bind) {
			rv = [];
			var bindings = Bind.getBindings(q);
			for (var i = 0; i < bindings.length; i++) {
				var _rv = getNodes(n, bindings[i]);
				for (var ii = 0; ii < _rv.length; ii++) {
					rv.push(_rv[ii]);
				}
			}
			return rv;
		}

		if (q.indexOf(':') >= 0) {
			rv = n.getElementsByTagName(q);
			if (rv.length < 1) {
				var p = q.split(":");
				if (p.length == 2) {
					rv = n.getElementsByTagName(p[1]);
				}
			}
		} else {
			rv = n.querySelectorAll('.' + q);
		}

		for (var i = 0; i < rv.length; i++) {
			Bind.importAttributes(rv[i]);
		}

		var _rv = [];
		for (var i = 0; i < rv.length; i++) {
			_rv.push(rv[i]);
		};

		return _rv;
	}; // getNodes()

} // Bind


var Build = function (constructor, o) {
	var _o = o || {};
	var n = null;

	for (var i in Bind.Classes) {
		if (Bind.Classes[i] === constructor) {
			n = document.createElement(i, _o);
			break;
		}
	}

	if (n === null && typeof(constructor) == 'function') {
		n = {};
		for (var i in _o) {
			n[i] = _o[i];
		};
		constructor.apply(n);
	}

	return n;
} // Build()
var New = Build;

console.log('Loaded Bind.');

upon(function() { return document.body; }, function() {
	_bindq = global._bindq || {};
	_bindq.push = function(c,b) { Bind(c,b); };
	if (_bindq instanceof Array) {
		for (var i = 0; i < _bindq.length; i += 2) {
			Bind(_bindq[i], _bindq[i+1]);
		}
	}
});
//
// TG namespace
//

var TG = TG || {};
TG.API = TG.API || {};

TG.API.longPolls = TG.API.longPolls || [];
TG.API.requests = TG.API.requests || {};

TG.addSlashes = function(s) {
	s = String(s);
	s = s.replace(/\\/g, "\\\\");
	s = s.replace(/\"/g, "\\\"");
	s = s.replace(/\'/g, "\\\'");
	return s;
}; // TG.addSlashes()


TG.jsonEscape = function(s) {
	s = String(s);
	s = s.replace(/\\/g, "\\\\");
	s = s.replace(/\"/g, "\\\"");
	s = s.replace(/\//g, "\\/");
	s = s.replace(/[\b]/g, "\\b");
	s = s.replace(/\f/g, "\\f");
	s = s.replace(/\n/g, "\\n");
	s = s.replace(/\r/g, "\\r");
	s = s.replace(/\t/g, "\\t");
	s = s.replace(/[^\u0020-\u007d]/g, function(s) {
			return '\\u' + ('0000' + s.charCodeAt(0).toString(16)).slice(-4);
		}
	);
	return s;
}; // TG.jsonEscape()


TG.jsonAddSlashes = function(s) {
	return TG.jsonEscape(s);
}; // TG.jsonAddSlashes()


TG.getNodeKeys = function(tag) {
	var o = {};
		o.childNodes = 1;
		o.contentglobal = 1;
		o.contentDocument = 1;
		o.ownerDocument = 1;

	var tag = (tag || 'div').toLowerCase();
	if (!tag || tag[0] == '#') return TG.getNodeKeys('div');

	if (!TG.getNodeKeys[tag]) {
		var n = document.createElement(tag);
		n.innerHTML = " <span> a</span>";
		n.style.display = 'none';
		document.body.appendChild(n);
		for (var i in n) {
			o[i] = 1;
		}
		document.body.removeChild(n);
		TG.getNodeKeys[tag] = o;
	}
	return TG.getNodeKeys[tag];
}; // TG.getNodeKeys()


TG.stringify = function (o, depth, stringify_instance, make_refs) {
	var d = typeof(depth) == 'number' ? depth : 128;
	if (d < 1) {
		return undefined;
	}

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
		rv = TG.stringify(
			new TG.DataObjectReference(o),
			d - 1,
			instance,
			false
		);
	} else if (typeof(o) === 'object') {
		var _rv = [];
		for (var i in o) {
			var omissions = {};
			if (o instanceof Node || o instanceof Element) {
				omissions = TG.getNodeKeys(o.nodeName || o.tagName);
			}
			omissions.__stringify_instance = 1;
			omissions.__parameters_imported = 1;
			omissions.__attributes_imported = 1;
			omissions.__AlreadyBound = 1;
			if (!omissions[i]) {
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

	if (!TG.API[api] || !TG.API[api].t) {
		TG.API[api] = {};
		TG.API.requestToken(api);
	}

	upon(
		function() { return (TG.API.poll && TG.API[api].t && TG.API[api].t.length > 0); },
		function() {
			// prepare callback function
			var token = TG.API[api].t.shift();

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
			var r = global.XMLHttpRequest ? new XMLHttpRequest()
				: new ActiveXObject("Microsoft.XMLHTTP");
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
						delete TG.API[api].longPoll;
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
				TG.API[api].longPoll = r;
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
			if (TG.API[api] && TG.API[api].longPoll) {
				TG.API[api].longPoll.abort();
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
	if (TG.API[api] && TG.API[api].longPoll) {
		TG.API[api].longPoll.abort();

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
		proxy.value = proxy.value || [];
		proxy.value.push(rv);
		if (typeof(proxy.returnfn) != 'undefined') {
			while (proxy.value.length > 0) {
				proxy.returnfn(proxy.value.shift());
			}
		}
	}; 

	proxy.callback = function(fn) {
		proxy.returnfn = fn;
		proxy.value = proxy.value || [];
		while (proxy.value.length > 0) {
			proxy.returnfn(proxy.value.shift());
		}
	};

	proxy.stop = function() {
		if (proxy.action) {
			TG.API.stop(proxy.action);
		}
	};

	// yep. we're a little indecisive about what to call our callback-registering-method
	var r = ['returnTo','returnto','outputTo','outputto','r','o','c','cb','callback'];
	for (var i = 0; i < r.length; i++) {
		proxy[r[i]] = proxy.callback;
	}

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
	if (typeof(rv) == 'object') {
		o = new rv.constructor;
	} else {
		o = rv;
	}
	TG.copy(rv, o);

	TG.API.requests[t][i].c(o);
}; // TG.API.cb()


TG.API.alter = function(t, i, r) {
	TG.API.requests[t][i].p = r;
}; // TG.API.alter()


TG.API.requestToken = function(api) {
	var tf = document.createElement('iframe');
	tf.src = api + "?tg-tr=1";
	tf.style.display = 'none';
	document.body.appendChild(tf);
}; // TG.API.requestToken()


TG.findGlobal = function(s) {
	var parts = s.split('.');
	var rv = global;
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
		} else if (isa(crv[i], 'TG.Internal')) {
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


TG.BaseObject = function(o) {
	for (var i in o) {
		this[i] = o[i];
	}
	setType(this, 'TG.BaseObject');
}; // TG.BaseObject


TG.Internal = function(o) {
	var _t = this;
	if (typeof(o) == 'function') {
		_t = o;
	}
	TG.BaseObject.apply(_t, arguments);
	setType(_t, 'TG.Internal');
	return _t;
}; // TG.Internal


// an object upon which server methods can be called
TG.ServerObject = function() {
	TG.BaseObject.apply(this, arguments);
	setType(this, 'TG.ServerObject');
}; // TG.ServerObject


// an object upon which CRUD ops can occur
TG.DataObject = function() {
	TG.ServerObject.apply(this, arguments);
	setType(this, 'TG.DataObject');
}; // TG.BaseObject


TG.DataObjectReference = function() {
	TG.ServerObject.apply(this, arguments);
	setType(this, 'TG.DataObjectReference');
}; // TG.DataObjectReference


TG.FunctionReference = function() {
	var rv = function() {
		var ref_id = this['tg-id'];
		var method;
		var runner = rv.isEvent ? TG.API.start : TG.API.jsonp;
		var args = TG.argumentsArray(arguments);
		for (var i in this) {
			if (this[i] === rv) {
				method = ref_id + '.' + i;
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


upon('Bind', function () {

	TG = global.TG || {};

	TG.DragDrop = TG.DragDrop || {

		active_draggable: null,
		drops: [],
		draggables: [],

		getCollection: function(o) {
			if (isa(o, 'TG.Draggable')) {
				return this.draggables;
			}
			if (isa(o, 'TG.SortableList')) {
				return this.drops;
			}
		}, // getList()

		contains: function(o) {
			var l = this.getCollection(o);
			for (var i = 0; i < l.length; i++) {
				if (l[i] == o) return i;
			}
			return false;
		}, // contains()

		objectAt: function (x, y, l) {
			var l = l || this.draggables;
			for (var i in l) {
				if (l[i].contains(x, y)) {
					return l[i];
				}
			}
			return null;
		}, // objectAt()

		dropSpotAt: function(x, y) {
			return this.objectAt(x, y, this.drops);
		}, // dropSpotAt()

		handleAt: function (x, y, l) {
			var l = this.draggables;
			var o = this.objectAt(x, y, l);
			if (o) {
				if (o.handleContains(x, y)) {
					return o;
				}
			}
			return null;
		}, // handleAt()

		add: function(o) {
			var c = this.getCollection(o);
			if (!this.contains(o, c)) c.push(o);
		}, // add()

		remove: function(o) {
			var c = this.getCollection(o);
			var i = this.contains(o, c);
			if (i) c.splice(i, 1);
			return i;
		}, // remove()

		grab: function(mc) {
			var o = null;
			if (!this.active_draggable) {
				o = this.handleAt(mc.x, mc.y);
				if (o && isa(o, 'TG.Draggable')) {
					if (typeof (o.enabled) === 'undefined' || o.enabled) {
						o.pickUp(mc, true);
						this.active_draggable = o;
						this.over_spot = this.dropSpotAt(mc.x, mc.y);
						this.over(mc);
					}
				}
			}
			return o;
		}, // grab()

		drag: function(mc) {
			if (this.active_draggable) {
				this.active_draggable.drag(mc);
				this.over(mc);
				return true;
			} else {
				return false;
			}
		}, // drag()

		over: function(mc) {
			var s = mc ? this.dropSpotAt(mc.x, mc.y) : null;
			if (s == null || s != this.over_spot) {
				if (this.over_spot) {
					this.over_spot.dragOut(this.active_draggable);
				}
				if (s) {
					s.dragOver(mc, this.active_draggable);
				}
				this.over_spot = s;
			}
		}, // over()

		drop: function(mc) {
			var o = this.active_draggable;
			if (o) {
				this.active_draggable = null;
				this.over(null);
				var droppedonto = null;
				var t = this.dropSpotAt(mc.x, mc.y) || o.getContainer();
				for (var i = 0; i < this.drops.length; i++) {
					if (this.drops[i] == t) {
						var ok = this.drops[i].dropOver(o, mc)
						droppedonto = ok ? t : null;
					} else {
						// removes any lingering drop preview
						this.drops[i].dropOver(null);
					}
				}
				if (droppedonto) {
					o.drop(mc, droppedonto);
				} else {
					o.return();
				}
				return true;
			} else {
				return false;
			}
		} // drop()

	}; // TG.DragDrop


	TG.SortableList = function () {
		this.add = function (item) {
			if (item == null) { return; }

			if (isa(item, Array)) {
				for (var i in item) {
					this.add(item[i]);
				}
			} else if (isa(item, 'TG.Draggable')) {
				var doAdd = true;
				for (var i in this.objects) {
					if (this.objects[i] == item) {
						doAdd = false;
						break;
					}
				}

				if (doAdd) {
					if (item.container && typeof (item.container.remove) === 'function') {
						item.container.remove(item);
					}

					item.index = this.objects.length;
					this.objects.push(item);
					item.container = this;

					if (item.parentNode !== this) {
						this.appendChild(item);
					}
				}
			} else {
				this.add(New(TG.Draggable(item, [this])));
			}

		}; // add()

		this.remove = function (item) {
			for (var i = 0; i < this.objects.length; i++) {
				if (this.objects[i] === item) {
					this.objects.splice(i, 1);
				}
			}
			return null;
		}; // remove()

		this.dragStart = function(item) {
			var ok = 1;

			if (typeof(this.ondragstart) == 'function') {
				ok = this.ondragstart(item);
			}

			if (ok) {
				this.remove(item);
				this.drop_preview = this.getDropPreview(item);
				return this.replaceChild(this.drop_preview, item);
			}

			return ok;
		}; // dragStart();

		this.dragOver = function(mc, item) {
			var ok = 1;
			if (typeof(this.ondragover) == 'function') {
				ok = this.ondragover(item);
			}
			if (ok) {
				var ro = TG.DragDrop.objectAt(mc.x, mc.y);
				if (ro == this) ro = null;
				var dp = this.getDropPreview(item);
				dp.move(this, ro);
			}
		}; // dragOver()

		this.dragOut = function(item) {
			this.removeDropPreview();
			if (typeof(this.ondragout) == 'function') {
				this.ondragout(item);
			}
		}; // dragOut()

		this.dropOver = function(o, mc) {
			var ok = Boolean(o);

			if (ok && typeof(this.ondropover) === 'function') {
				ok = this.ondropover(o);
			}

			if (ok && o) {
				this.add(o);
				this.insertBefore(o, this.getDropPreview(o));
			}

			this.removeDropPreview();
			return ok;
		}; // dropOver()

		this.contains = function (x, y) {
			var coords = new TG.NodeCoords(this);
			return coords.contains(x, y);
		}; // contains()

		this.getObjects = function () {
			return this.objects;
		}; // getObjects()

		this.getDropPreview = function(item, s) {
			if (!this.drop_preview) {
				this.drop_preview = New(TG.DropPreview, {container: this});
				copyStyle(
					item,
					this.drop_preview,
					TG.DropPreview.relevantStyles
				);
				this.appendChild(this.drop_preview);
			}
			return this.drop_preview;
		}; // getDropPreview()

		this.removeDropPreview = function() {
			if (this.drop_preview) {
				this.removeChild(this.drop_preview);
				this.drop_preview = null;
				return true;
			} else {
				return false;
			}
		}; // removeDropPreview()

		this.objects = [];
		this.dragging = null;
		this.drop_preview = null;

		// container must be positioned either absolutely or relatively
		// to allow ... ? ... wait ... what?
		if (this.style.position != 'absolute') {
			this.style.position = 'relative';
		}

		setType(this, 'TG.SortableList');

		TG.DragDrop.add(this);

	}; // SortableList
	Bind(TG.SortableList, 'tg-sortable-list');
	Bind(TG.SortableList, 'tg:sortablelist');


	// DropSpot
	// Spot that holds a single Draggable
	TG.DropSpot = function() {
		TG.SortableList.apply(this, arguments);

		/*
		this.remove = function(o) {
		}; // remove()

		this.dragStart = function(o) {
		}; // dragStart()

		this.dragOver = function(o, mc) {
		}; // dragOver()

		this.drop = function(o) {
		}; // drop()
		*/

		this.dragOut = function(item) {
			if (typeof(this.ondragout) == 'function') {
				this.ondragout(item);
			}
		}; // dragOut()

		setType(this, 'TG.DropSpot');
	}; // TG.DropSpot
	Bind(TG.DropSpot, 'tg-drop-spot');



	// Draggable
	// Turns a node or object with a .node property into a drag-droppable thing.
	// The container parameter can either be a Node or an Array of Nodes
	TG.Draggable = function () {
		setType(this, 'TG.Draggable');

		this.container = null;
		this.handle = this.handle || this['data-handle'] || this;
		this.index = 0;
		this.dragging = false;
		this.x_offset = 0;
		this.y_offset = 0;
		this.coords = function () { return new TG.NodeCoords(this); };
		this.old_coords = null;
		this.drop_preview = null;
		this.screen_protector = null;

		this.debug = null;

		this.destroy = function () {
			this.handle.style.cursor = 'default';
			this.o = null;
			this.targets = null;
			this.container = null;
			this.handle = null;
		}; // destroy()

		this.contains = function (x, y) {
			if (!this.dragging) {
				var nc = new TG.NodeCoords(this);
				return nc.contains(x, y);
			} else {
				return false;
			}
		}; // contains()

		this.handleContains = function (x, y) {
			if (!this.dragging) {
				var nc = new TG.NodeCoords(this.handle);
				return nc.contains(x, y);
			} else {
				return false;
			}
		}; // handleContains()

		this.getContainer = function() {
			if (!this.container) {
				if (isa(this.parentNode, 'TG.DropSpot')
					|| isa(this.parentNode, 'TG.SortableList')
				) {
					this.container = this.parentNode;
					this.container.add(this);
				} else if (this.sticky || this['data-sticky']) {
					this.container = New(TG.DropSpot);
					copyStyle(
						this,
						this.container,
						['display','position','float','clear']
					);
					this.parentNode.insertBefore(this.container, this);
					this.container.add(this);
				}
			}
			return this.container;
		}; // getContainer()

		this.pickUp = function(mc) {
			this.screen_protector = New(TG.ScreenProtector);
			document.body.appendChild(this.screen_protector);

			this.old_coords = new TG.NodeCoords(this);
			this.x_offset = mc.x - this.coords().x;
			this.y_offset = mc.y - this.coords().y;

			var _t = this;

			var c = this.getContainer();
			if (c) {
				c.dragStart(this);
				this.returnto = c;
			}

			// flag it as being dragged.
			this.dragging = true;
			this.setStyles();
			document.body.appendChild(this);

			this.style.left = (mc.x - this.x_offset) + 'px';
			this.style.top = (mc.y - this.y_offset) + 'px';
		}; // pickUp()

		this.drag = function (mc) {
			this.style.left = (mc.x - this.x_offset) + 'px';
			this.style.top = (mc.y - this.y_offset) + 'px';
		}; // drag()

		this.drop = function (mc, t) {
			if (this.screen_protector) {
				this.screen_protector = this.screen_protector.remove();
			}

			this.dragging = false;
			this.setStyles();

			if (typeof(this.ondrop) == 'function') {
				this.ondrop(mc, t);
			}
		}; // drop()

		this.setStyles = function() {
			if (this.dragging) {	
				this.style.opacity = 0.5;
				this.style.filter = 'alpha(opacity=50)';
				this.style.position = 'absolute';
				this.style.zIndex = 1000;
			} else {
				if (this.getContainer()) {
					this.style.position = '';
					this.style.left = '';
					this.style.top = '';
					this.style.zIndex = '';
				}

				this.style.opacity = '';
				this.style.filter = '';

				this.x_offset = 0;
				this.y_offset = 0;
			}
		}; // setStyles()

		this.return = function() {
			if (this.returnto) {
				this.returnto.add(this);
			}
			this.drop(null, null);
		}; // return()

		this.hide = function() {
			this._display = this.style.display;
			this.style.display = 'none';
		}; // hide()

		this.show = function() {
			this.style.display = this._display || '';
		}; // show()

		TG.DragDrop.add(this);

	}; // Draggable

	TG.Draggable.compare = function (a, b) {
		if (a.index > b.index) {
			return 1;
		} else {
			return -1;
		}
	}; // Draggable.compare()

	Bind(TG.Draggable, 'tg-draggable');
	Bind(TG.Draggable, 'tg:draggable');


	// DropPreview
	// The placeholder that's moved around the DropZones during dragging.
	TG.DropPreview = function () {
		setType(this, 'TG.DropPreview');

		this.index = 0;

		this.contains = function (x, y) {
			var nc = new TG.NodeCoords(this);
			return nc.contains(x, y);
		}; // contains()

		this.move = function (container, o) {
			/*
			var inspace = false;
			if (!this.drop_preview.contains(mc.x, mc.y)) {
				inspace = true;
				var o = DragDrop.objectAt(mc.x, mc.y);
				var oc = o.getContainer();
				for (var i = 0; i < this.targets.length; i++) {
					if (this.targets[i] == oc) {
						this.drop_preview.move(oc, o);
						inspace = false;
					}
				}
			}

			if (
				inspace
				&& (this.prefer_home || this.preferHome)
				&& isa(this.home, Node)
			) {
				this.drop_preview.move(this.home);
			}

			if (o === this) {
				return;
			}

			if (container !== this.container) {
				if (typeof (container.onmoveover) === 'function') {
					container.onmoveover(o);
				}
				if (this.container && typeof (this.container.onmoveout) === 'function') {
					this.container.onmoveout(o);
				}
			}

			if (o) {
				this.container = container;
				if (o.previousSibling === this) {
					o.parentNode.insertBefore(this, o.nextSibling);
					this.index = o.index + 1;
				} else {
					o.parentNode.insertBefore(this, o);
					this.index = o.index;
				}
			} else if (container && isa(container, Node)) {
				this.container = container;
				container.appendChild(this);
				for (var i = 0; i < container.objects.length; i++) {
					if (this.index <= container.objects.length) {
						this.index = container.objects.length;
					}
				}
				this.index += 1;
			}
			*/
		}; // move()

		this.style.border = '2px solid green';

	}; // TG.DropPreview
	TG.DropPreview.templateMarkup = "&nbsp;";
	TG.DropPreview.relevantStyles = [
		'display','position','width','height','top','left','border-width','margin',
		'padding', 'float','clear'
	];
	Bind(TG.DropPreview, 'tg-drop-preview');


	// ScreenProtector
	// Invisible node that covers the screen during drag-dropping to prevent
	// inadvertent text highlighting and image or link dragging.
	TG.ScreenProtector = function () {

		setType(this, 'TG.ScreenProtector');

		this.remove = function () {
			document.body.removeChild(this);
			return null;
		} // remove()

	}; // ScreenProtector
	TG.ScreenProtector.templateMarkup = " ";
	Bind(TG.ScreenProtector, 'tg-screen-protector');


	// TG.NodeCoords
	// Determines and contains the coordinates for a node.
	TG.NodeCoords = function (n) {

		this.x = n.offsetLeft;
		this.y = n.offsetTop;

		var temp = n;
		while (temp = temp.offsetParent) {
			this.x += temp.offsetLeft;
			this.y += temp.offsetTop;
		}

		this.left = this.x;
		this.top = this.y;

		this.width = n.offsetWidth;
		this.right = this.x + n.offsetWidth;

		this.height = n.offsetHeight;
		this.bottom = this.y + n.offsetHeight;

		var style = {
			marginLeft: "", marginRight: "",
			marginTop: "", marginBottom: ""
		};

		if (n.currentStyle) {
			style = n.currentStyle;
		} else if (global.getComputedStyle) {
			style = getComputedStyle(n);
		}

		this.marginLeft =
			parseInt(style.marginLeft.replace(/[^0-9]/g, '') || '0');
		this.marginRight =
			parseInt(style.marginRight.replace(/[^0-9]/g, '') || '0');
		this.marginTop =
			parseInt(style.marginTop.replace(/[^0-9]/g, '') || '0');
		this.marginBottom =
			parseInt(style.marginBottom.replace(/[^0-9]/g, '') || '0');

		this.contains = function (x, y) {
			var ex = this.x - Math.ceil(this.marginLeft / 2);
			var ey = this.y - Math.ceil(this.marginTop / 2);
			var eright = this.right * 1 + Math.ceil(this.marginRight / 2);
			var ebottom = this.bottom * 1 + Math.ceil(this.marginBottom / 2);
			if (x >= ex && x <= eright && y >= ey && y <= ebottom) {
				return true;
			} else {
				return false;
			}
		}; // contains()

	}; // TG.NodeCoords


	document.onmousedown = function (evt) {
		var e = evt || global.event;
		var mc = new TG.MouseCoords(e);
		if (TG.DragDrop.grab(mc) && typeof(e.preventDefault) == 'function') {
			e.preventDefault();
		}
	}; // document.onmousedown()

	document.onmousemove = function (evt) {
		var e = evt || global.event;
		var mc = new TG.MouseCoords(e);
		if (TG.DragDrop.drag(mc) && typeof(e.preventDefault) == 'function') {
			e.preventDefault();
		}
	}; // document.onmousemove()

	document.onmouseup = function (evt) {
		var e = evt || global.event;
		var mc = new TG.MouseCoords(e);
		if (TG.DragDrop.drop(mc) && typeof(e.preventDefault) == 'function') {
			e.preventDefault();
		}
	}; // document.onmouseup()

	document.ontouchstart = document.onmousedown;
	document.ontouchmove = document.onmousemove;
	document.ontouchend = document.onmouseup;
	document.ontouchleave = document.onmouseup;
	document.ontouchcancel = document.onmouseup;

	console.log('TG.DragDrop loaded. (2)');

});
var TG = TG || {};
TG.Testing = TG.Testing || {

	Test: function(name, test) {
		this.name = name;
		this.test = function() {
			var rv;
			try {
				test();
				rv = {
					success: true,
					name: name,
					message: ""
				};
			} catch (ex) {
				rv = {
					success: false,
					name: name,
					message: TG.stringify(ex)
				};
			}

			return rv;
		}; // test()
		setType(this, 'TG.Testing.Test');
	},

	FakeDisk: function(storage) {

		var storage = storage || {};
		var backup = {};

		this.build = function() {
			backup.tg_save = tg_save;
			backup.tg_retrieve = tg_retrieve;
			backup.tg_delete = tg_delete;

			tg_save = function(js) {
				// var id = tg_save(TG.stringify(_t, null, null, true));
				eval('var o = ' + js);
				if (!o['tg-id']) {
					o['tg-id'] = 'MEM-' + (new Date()).getTime() + '.' + Math.random();
				}
				var id = o['tg-id'];
				storage[id] = TG.stringify(o, null, null, true);
				return id;
			}; // TEMP tg_save()

			tg_retrieve = function(id) {
				return storage[id];
			}; // TEMP tg_retrieve()

			tg_delete = function(id) {
				delete storage[id];
			}; // TEMP tg_delete()
		}; // build()

		this.dispose = function() {
			tg_save = backup.tg_save;
			tg_retrieve = backup.tg_retrieve;
			tg_delete = backup.tg_delete;
		}; // destroy

		this.build();

		setType(this, 'TG.Testing.FakeDisk');
	}, // TG.Testing.FakeDisk

	Suite: function() {
		TG.DataObject.apply(this);

		this.suite = arguments;
		this.run = function() {
			var disk = new TG.Testing.FakeDisk();

			var rv = { passed: [], failed: [] };
			for (var i = 0; i < this.suite.length; i++) {
				var t = this.suite[i];

				if (i == 0 && t && typeof(t) == 'string') {
					eval.call(global, tg_readfile(t));
				} else if (isa(t, 'TG.Testing.Test')) {
					var r = t.test();
					if (r.success) {
						rv.passed.push(r);
					} else {
						rv.failed.push(r);
					}
				}
			}

			disk.dispose();

			return rv;
		}; // run()

		setType(this, 'TG.Testing.Suite');
	}

}; // TG.Testing


TG.assert = function(passed, failure_description) {
	if (!passed) {
		throw String(failure_description);
	}
}; // TG.assert()

var TG = TG || {};
TG.UI = TG.UI || {};
var _bindq = _bindq || [];

TG.UI.SubmitButton = function() {
	var _t = this;
	this.submitButton.onclick = function() {
		on(_t, 'submit').fire();
	}; // onclick()

	setType(this, 'TG.UI.SubmitButton');
	onready(this).fire();
}; // TG.UI.SubmitButton
TG.UI.SubmitButton.templateMarkup = "\
	<input type='button' data-id='submitButton' value='Sign in' />\
";
_bindq.push(TG.UI.SubmitButton, 'tg-submit-button');


TG.UI.Field = function() {
	var _t = this;

	this.style.width = '100%';

	this.setName = function(n) {
		this.fieldInput.name = n;
		this.fieldLabel.innerHTML = n;
	}; // setName()

	this.getName = function() {
		return this.fieldLabel.innerHTML;
	}; // getName()

	this.setValue = function(v) {
		this.fieldInput.value = v;
	}; // setValue()

	this.getValue = function() {
		return this.fieldInput.value;
	}; // getValue()

	this.focus = function() {
		this.fieldInput.focus();
	}; // focus();

	this.blur = function() {
		this.fieldInput.blur();
	}; // blur()

	var n = this.name || this['data-name'] || '';
	this.setName(n);

	var v = this.value || this['data-value'] || '';
	this.setValue(v);

	var t = this.type || this['data-type'] || this.fieldInput.type;
	this.fieldInput.type = t;

	this.onclick = function() { this.fieldInput.focus(); };

	setType(this, 'TG.UI.Field');
	onready(this).fire();
}; // TG.UI.Field
TG.UI.Field.templateMarkup = "\
	<label data-id='fieldLabel' style='display: inline-block; width: 33%; margin: 0px;'></label>\
	<input type='text' data-id='fieldInput' style=' display: inline-block; width: 60%;'></input>\
";
_bindq.push(TG.UI.Field, 'tg-field');


TG.UI.PasswordField = function() {
	this.type = 'password';
	TG.UI.Field.call(this);
	setType(this, 'TG.UI.PasswordField');
	onready(this).fire();
}; // TG.UI.PasswordField
TG.UI.PasswordField.templateMarkup = TG.UI.Field.templateMarkup;
_bindq.push(TG.UI.PasswordField, 'tg-password-field');


TG.UI.RadioGroup = function() {
	var _t = this;

	this.options = [];
	this.index = {};
	this.selected = null;

	this.add = function(o) {
		if (isa(o, 'TG.UI.Radio')) {
			this.container.appendChild(o);
			this.options.push(o);
			this.index[o.value] = o;
			on(o, 'selectaction', function() { _t.setValue(o.value); });
			if (o.selected) _t.setValue(o.value);
		}
	}; // add()

	this.setValue = function(v) {
		for (var i in this.index) {
			if (i != v) {
				this.index[i].deselect();
			} else {
				this.index[i].select();
				this.selected = this.index[i];
			}
		}
	}; // setValue()

	this.getValue = function() {
		if (this.selected) {
			return this.selected.value;
		} else {
			return undefined;
		}
	}; // getValue()

	onready(this.parameters, function() {
		for (var i = 0; i < _t.parameters.length; i++) {
			_t.add(_t.parameters[i]);
		}
	});

	setType(this, 'TG.UI.RadioGroup');
	onready(this).fire();
}; // TG.UI.RadioGroup
TG.UI.RadioGroup.templateMarkup = "<div data-id='container'></div>";
// TG.UI.RadioGroup.templateMarkup = "<div data-id='radioDiv'></div>";
_bindq.push(TG.UI.RadioGroup, 'tg-radio-group');


TG.UI.Radio = function() {
	// TG.UI.Field.call(this);

	var _t = this;

	this.style.display = 'inline-block';
	this.style.margin = '0.5em';

	this.value = this.value || this['data-value'] || '';

	this.select = function() {
		if (!this.fieldInput.checked) {
			this.fieldInput.checked = true;
			on(this, 'change').fire();
			on(this, 'select').fire();
		}
	}; // select()

	this.deselect = function() {
		if (this.fieldInput.checked) {
			this.fieldInput.checked = false;
			on(this, 'change').fire();
			on(this, 'deselect').fire();
		}
	}; // deselect()

	this.onclick = function() {
		on(this, 'selectaction').fire();
	}; // fieldInput.onchange()

	for (var i = 0; i < this.parameters.length; i++) {
		this.fieldLabel.appendChild(this.parameters[i]);
	}

	setType(this, 'TG.UI.Radio');
	onready(this).fire();
}; // TG.UI.Option
TG.UI.Radio.templateMarkup = "\
	<input type='radio' data-id='fieldInput'></input>\
	<label data-id='fieldLabel'></label>\
";
_bindq.push(TG.UI.Radio, 'tg-radio');


TG.UI.LoginLink = function() {

	var _t = this;
	this.isExpanded = false;

	this.toggle = function() {
		if (this.isExpanded) {
			this.collapse();
		} else {
			this.expand();
		}
	}; // toggle()

	this.expand = function() {
		this.isExpanded = true;
		this.loginBox.style.display = 'block';
		this.loginBox.focus();
	}; // expand()

	this.collapse = function() {
		this.isExpanded = false;
		this.loginBox.style.display = 'none';
	}; // collapse()

	this.actionLink.onclick = function() {
		_t.toggle(); return false;
	}; // actionLink.onclick()


	on(this.loginBox, 'submit', function(rv) {
		if (rv) {
			_t.collapse();
		}
	}); // loginBox.on(submit)

	/*
	TG.Users.onAuthChange().returnTo(function(user) {
		if (user && user.getUsername()) {
			_t.actionLink.innerHTML = "Sign out";
		} else {
			_t.actionLink.innerHTML = "Sign in";
		}
	});
	*/

	setType(this, 'TG.UI.LoginLink');
	onready(this).fire();
}; // TG.UI.LoginLink
TG.UI.LoginLink.templateMarkup = "\
	<a style='cursor: pointer;' data-id='actionLink'>Sign in</a>\
	<div data-id='loginBox' style='display: none; width: 300px;' class='tg-login-box'></div>\
";
_bindq.push(TG.UI.LoginLink, 'tg-login-link');


TG.UI.LoginBox = function() {
	var _t = this;

	onready(this, function() {
		if (_t.focused == 1) {
			_t.focus();
		} else {
			_t.blur();
		}
	});

	this.setMessage = function(m) {
		this.statusBox.innerHTML = m;
		this.statusBox.style.display = m ? '' : 'none';
	}; // setMessage()

	this.focus = function() {
		this.username.focus();
	}; // focus();

	this.blur = function() {
		this.username.blur();
		this.password.blur();
	}; // blur()

	this.submit = function() {
		TG.Users[this.action.getValue()](
			this.username.getValue(),
			this.password.getValue()
		).returnTo(function(rv) {
			if (rv) {
				_t.setMessage('Logging in ...');
			} else {
				_t.setMessage('Bad credentials. Try again.');
			}
			on(_t, 'submit').fire(rv);
		});
		this.password.setValue('');
	}; // submit()

	this.clear = function() {
		this.username.setValue('');
		this.password.setValue('');
	}; // clear()

	on(this.submitButton, 'submit', function() { _t.submit(); });

	this.formNode.onsubmit = function() {
		_t.submit();
		return false;
	}; // form.onsubmit()

	setType(this, 'TG.UI.LoginBox');
	onready(this).fire();
}; // TG.UI.LoginBox
TG.UI.LoginBox.templateMarkup = "\
	<div data-id='statusBox' style='display: none; color: red;'></div>\
	<form name='nosubmit' action='nosubmit' data-id='formNode'>\
	<div class='tg-radio-group' data-id='action'>\
		<div class='tg-radio' data-value='authenticate' selected='1'>Sign In</div>\
		<div class='tg-radio' data-value='add'>\
			Create Account\
		</div>\
	</div>\
	<div class='tg-field' data-id='username' data-name='Username'></div>\
	<div class='tg-password-field' data-id='password' data-name='Password'>\
	</div>\
	<div data-id='submitButton' class='tg-submit-button'></div>\
	</form>\
";
_bindq.push(TG.UI.LoginBox, 'tg-login-box');


TG.UI.DocumentList = function() {
}; // TG.UI.DocumentList


TG.UI.TestRun = function() {
	var _t = this;

	this.header.innerHTML = this.testobject;

	this.processResults = function(rv) {
		_t.loader.style.display = 'none';

		for (var i = 0; i < rv.failed.length; i++) {
			_t.appendChild(New(TG.UI.TestResult, rv.failed[i]));
		}

		for (var i = 0; i < rv.passed.length; i++) {
			_t.appendChild(New(TG.UI.TestResult, rv.passed[i]));
		}
	}; // processResults()

	this.run = function() {
		this.loader.style.display = '';
		upon(function() { return TG.UI.TestResult; }, function() {
			if (!TG.findGlobal(_t.testobject)) {
				var s = document.createElement('script');
				s.src = _t.api;
				s.type = 'text/javascript';
				document.body.appendChild(s);
			}

			upon(function() { return TG.findGlobal(_t.testobject); }, function() {
				TG.findGlobal(_t.testobject).run().returnTo(_t.processResults);
			});
		});
	}; // run()

	setType(this, 'TG.UI.TestRun');
	onready(this).fire();

	if (this.autorun == 1) { this.run(); }

}; // TG.UI.TestRun()
TG.UI.TestRun.templateMarkup = "\
	<h3 data-id='header'>Test Results</h3>\
	<div data-id='loader' style='color: silver; display: none;'>running ...</div>\
";
_bindq.push(TG.UI.TestRun, 'tg-test-run');


TG.UI.TestResult = function() {
	if (this.success) {
		this.style.color = 'green';
		this.successString.innerHTML = 'PASS';
	} else {
		this.style.color = 'red';
		this.successString.innerHTML = 'FAIL';
	}

	var m = '';
	if (typeof(this.message) == 'string') {
		m = this.message;
	} else if (typeof(this.message) !== 'undefined') {
		m = TG.stringify(this.message);
	}
	m = m.replace("\n", "<br />\n");
	this.messageNode.innerHTML = m;
	
	if (TG.UI.alternate) {
		this.style.backgroundColor = '#f0f0ff';
	}
	TG.UI.alternate = !TG.UI.alternate;

	setType(this, 'TG.UI.TestResult');
	onready(this).fire();
}; // TestResult()
TG.UI.alternate = false;
TG.UI.TestResult.templateMarkup = "\
	<table style='width: 90%;'><tr>\
		<td data-id='successString' style='width: 30pt;'></td>\
		<td style='width: auto;'>\
			<div data-id='name' style='font-weight: bold;'></div>\
			<div data-id='messageNode'></div>\
		</td>\
		<td style='width: 25pt; text-align: right;'>\
			<span data-id='duration'>0</span>\
		</td>\
		<td style='width: 10pt'>\
			<span style='color: silver;'>ms</span>\
		</td>\
	</tr></table>\
";
_bindq.push(TG.UI.TestResult, 'tg-test-result');

global.Bind = Bind;