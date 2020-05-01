(function() {

	if (this.tgmodule && this.require) {
		return;
	}

	var stack = [];
	var pathstack = ['.'];

	tgmodule = {
		'start': function(name) {
			stack.push(name);
		},
		'end': function(name) {
			if (stack[stack.length - 1] === name) {
				stack.pop();
			}
		},
		'setpath': function(path) {
			pathstack.push(path === './' ? '.' : path);
		},
		'unsetpath': function() {
			pathstack.pop();
		},
		'list': function() {
			var rv = [];
			for (var k in require.cache) {
				rv.push(k);
			}
			return rv;
		},
		'd': function(p,n,f) {
			var module = {};
			this.setpath(p);
			this.start(n);
			var src = stack[stack.length - 1];
			typeof(f) === 'function' ? f(module) : module.exports = f;
			require.cache[src] = module;
			this.end(n);
			this.unsetpath();
		}
	};

	require = function(src) {
		var m = require.cache[require.resolve(src)];
		if (!m) { throw "`" + src + "` does not exist."; }
		return m.exports;
	};

	require.cache = {};

	require.resolve = function(src) {
		var path = src.split(/\//);
		var wcpath = pathstack[pathstack.length - 1].split(/\//);
		while (path[0] == '..') {
			path.shift();
			wcpath.pop();
		}
		while (path[0] == '.') {
			path.shift();
		}
		return wcpath.join('/') + '/' + path.join('/');
	}; // resolve()

})();


tgmodule.d('./','./tg-upon.js',function(module){
upon = function(test, fn) {
	if (typeof(test) == 'function' && test()) {
		fn();
	} else if (typeof(test) == 'string' && window[test]) {
		fn();
	} else {
		setTimeout(function() { upon(test, fn); }, 50);
	}
}; // upon()

});

tgmodule.d('./','./tg-namespace.js',function(module){
TG = this.TG || {};
TG.API = TG.API || {};
TG.Data = TG.Data || {};
TG.UI = TG.UI || {};
});

tgmodule.d('./','./tg-upon.js',function(module){
});

tgmodule.d('./','./tg-events.js',function(module){
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


});

tgmodule.d('./','./tg-set.js',function(module){
TG.Set = function(v) {
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
}; // Set

module.exports = TG.Set;
});

tgmodule.d('./','./tg-types.js',function(module){
Element = window.Element || function () { return true; };
Node = window.Node || window.Element;

getTypeId = function(t) {
	var id = t;
	if (typeof(t) == 'function') {
		var bound = Bind.getBindings(t);
		if (bound.length > 0) {
			id = bound[0];
		} else {
			id = t.name || t.toString();
		}
	}
	return id;
}; // getTypeId()

setType = function (o, constructor) {
	o.__types = o.__types || {};
	var t = this.getTypeId(constructor);
	if (t && o.__types[t] == null) {
		var v = 0;
		for (var i in o.__types) {
			v = Math.max(v, o.__types[i]);
		}
		v += 1;
		o.__types[t] = v;
	}
}; // setType()
registerType = setType;


isa = function (o, constructor) {
	var oT = typeof(o);
	var cT = typeof(constructor);

	if (oT === 'string') {
		return constructor === String;
	}
	if (oT === 'number') {
		return constructor === Number;
	}
	if (o === undefined || o === null) {
		return cT === oT;
	}
	if (oT === 'boolean') {
		return oT == cT;
	}

	if (cT === 'string' || cT === 'function') {
		o.__types = o.__types || {};
		if (constructor && o.__types[this.getTypeId(constructor)]) {
			return true;
 		}
	}

	if (
		constructor === Element
		|| constructor === Node
		|| constructor === NodeList
		|| cT  === 'function'
	) {
		return o instanceof constructor;
	}
	return o === constructor;
}; // isa()


module.exports = {
	isa: isa,
	getTypeId: getTypeId,
	setType: setType,
	registerType: registerType
};
});

tgmodule.d('./','./tg-css.js',function(module){
TG.getClassnames = function(node) {
	return (new TG.Set(node.className.split(/\s+/))).toArray();
}; // getClassnames()

TG.addClassname = function(node, classname) {
	var classes = new TG.Set(node.className.split(/\s+/));
	classes.add(classname);
	node.className = classes.toArray().join(' ');
}; // addClassname()

TG.removeClassname = function(node, classname) {
	var classes = new TG.Set(node.className.split(/\s+/));
	classes.remove(classname);
	node.className = classes.toArray().join(' ');
}; // removeClassname()

TG.currentStyle = function(node, key) {
	return node.currentStyle ? node.currentStyle[key]
		: document.defaultView.getComputedStyle(node, '')[key];
}; // currentStyle()

TG.copyStyle = function(f, t, asComputed) {
	if (asComputed instanceof Array) {
		for (var i = 0; i < asComputed.length; i++) {
			t.style[asComputed[i]] = TG.currentStyle(f, asComputed[i]);
		}
	} else {
		for (var i in f.style) {
			t.style[i] = asComputed ? TG.currentStyle(f, i) : f.style[i];
		}
	}
	var c = TG.getClassnames(f);
	for (var i = 0; i < c.length; i++) {
		TG.addClassname(t, c[i]);
	}
}; // copyStyle()


module.exports = {
	getClassname: TG.getClassname,
	addClassname: TG.addClassname,
	remoeClassname: TG.removeClassname,
	copyStyle: TG.copyStyle,
	currentStyle: TG.currentStyle
};
});

tgmodule.d('./','./tg-profiler.js',function(module){
TGProfiler = new function() {

	var profiles = {}

	this.start = function(name) {
		return new Profile(name);
	};

	this.watch = function(name, f) {
		return function() {
			var profile = new Profile(name);
			var rv = f.apply(this, Array.prototype.slice.call(arguments, 0));
			profile.stop();
			return rv;	
		}
	};

	this.append = function(profile) {
		profiles[profile.name] = profiles[profile.name] || [];
		profiles[profile.name].push(profile);
	};

	this.getSummary = function() {
		var rv = {};
		for (var name in profiles) {
			_profiles = profiles[name];
			rv[_profiles[0].name] = {
				count: _profiles.length,
				time: _profiles.reduce(function(sum, profile) {
					return sum + profile.getTime() ;
				}, 0)
			};
		}
		return rv;
	};

};

var Profile = function(name) {

	var start, end;

	this.init = function() {
		this.name = name;
		TGProfiler.append(this);
		start = new Date();
	};

	this.stop = function() {
		end = new Date();
	};

	this.getTime = function() {
		if (end) {
			return end.getTime() - start.getTime();
		} else {
			return (new Date()).getTime() - start.getTime();
		}
	};

	this.init();
}

module.exports = TGProfiler;


});

tgmodule.d('./','./tg-dom.js',function(module){
require('tg-namespace.js');
require('tg-upon.js');
require('tg-events.js');
require('tg-set.js');
require('tg-types.js');
require('tg-css.js');

var Profiler = require('tg-profiler.js');


this.console = this.console || {
	log_items: [],
	log: function () {
		for (var i = 0; i < arguments.length; i++) {
			this.log_items.push(arguments[i]);
		}
	}
} // console


if (!this.Bind) {

	this.DomClass = function(template, constructor) {
		constructor  = constructor || function NullConstructor() {}
		var name = constructor.name || "<unknown>";
		constructor = Profiler.watch(name, constructor);
		constructor.template = template;
		Bind(constructor);
		var f = Profiler.watch("DomClass " + name, function (arg) {
			return New(constructor, arg);
		});
		f.apply = function(_t, _a) { return constructor.apply(_t, _a); };
		f.call = function() {
			var _t = Array.prototype.shift.apply(arguments);
			return constructor.call(_t, arguments);
		};
		f.__constructor = constructor;
		f.name = constructor.name;
		return f;
	}; // DomClass()

	this.Bind = function (constructor, binding, scope) {
		if (typeof (constructor) == 'function') {
			var binding = Bind.addBinding(constructor, binding);
			constructor.binding = binding;
			var nodes = getNodes(isa(scope, Node) ? scope : document, binding);
			Bind.Apply(constructor, nodes);
			return nodes.length;
		} else if (isa(constructor, Node)) {
			Bind.BindExistingConstructors(constructor);
		}
	}; // Bind()

	Bind.BindExistingConstructors = function(node, f) {
		var deps = [];
		var bindings = (f && f.dependencies) || Bind.Classes;
		for (var binding in bindings) {
			if (Bind(Bind.Classes[binding], binding, node) > 0) {
				deps[binding] = 1;
			}
		}
		(f && !f.dependencies) ? (f.dependencies = deps) : null;
	}; // this.Bind.BindExistingConstructors()

	Bind.Apply = function(constructor, nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var n = nodes[i];
			if (!n.__AlreadyBound) {
				Bind.importParameters(constructor, n);
				Bind.ApplyClone(constructor, n);
				Bind.ApplyConstructor(constructor, n);
				Bind.importAttributes(n);
				n.__AlreadyBound = true;
			}
		}
	}; // Apply()

	Bind.ApplyTemplate = function (constructor, node) {
		var template = Bind.templateFor(constructor)
		if (template) {
			node.innerHTML = template;
		}
	}; // ApplyTemplate()

	Bind.ApplyClone = function(constructor, node) {
		// makes sense, but what problem did this conditional solve?
		// ... optimization?
		if (!Bind.templateFor(constructor)) { return; }

		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
		var clone = Bind.getClone(constructor);
		if (clone.childNodes.length == 0) clone = node.__holdingDiv;
		while (clone.firstChild) {
			node.appendChild(clone.removeChild(clone.firstChild));
		}
	}; // ApplyClone

	Bind.ApplyConstructor = function(constructor, node) {
		Bind.BindExistingConstructors(node, constructor);
		setType(node, constructor);
		Bind.attachIdentifiedChildren(node);
		Bind.applyParameters(node);
		constructor.apply(node);
	}; // ApplyConstructor()

	Bind.applyProperties = function(node, obj) {
		var o = typeof(obj) == 'object' ? obj : {};
		for (var i in o) {
			if (o.hasOwnProperty(i)) node[i] = o[i];
		}
	}; // applyProperties()


	Bind.originalCreateElement = document.createElement;
	Bind.createNode = function(constructor, tag) {
		tag = tag || constructor.binding;
		var container = Bind.originalCreateElement.call(document, 'div');
		if (tag.indexOf(':') == 0) { tag = tag.substr(1); }
		if (tag.indexOf('.') == 0) {
			var className = tag.substr(1);
			tag = 'tg:element';
		}
		container.innerHTML = '<' + tag + '></' + tag + '>';
		var rv = container.firstChild;
		rv.className = className || '';
		return rv;
	}; // createNode()

	Bind.Classes = {};


	document.createElement = function(tag, o) {
		var constructor = Bind.getConstructor(tag);
		if (constructor) {
			var node = Bind.getClone(constructor);
			Bind.applyProperties(node, o);
			Bind.ApplyConstructor(constructor, node);
			node.__AlreadyBound = true;
		} else {
			var node = Bind.originalCreateElement.call(this, tag);
			Bind.applyProperties(node, o);
		}
		return node;
	}; // document.createElement()

	Bind.getClone = function(constructor) {
		if (!constructor.templateNode) {
			constructor.templateNode = Bind.createNode(constructor);
			Bind.ApplyTemplate(constructor, constructor.templateNode);
		}
		return constructor.templateNode.cloneNode(true);
	}; 

	Bind.addBinding = function(constructor, binding) {
		if (!binding) {
			binding = Bind.bindingQueryFromConstructor(constructor);
		}
		Bind.Classes[binding] = constructor;
		return binding;
	}; // addBinding()


	Bind.bindingQueryFromConstructor = function(constructor) {
		var sample = document.createElement('div');
		sample.innerHTML = Bind.templateFor(constructor);
		for (var i = 0; i < sample.childNodes.length; i++) {
			var binding = Bind.bindingQueryFromNode(sample.childNodes[i]);
			constructor.template = sample.childNodes[i].innerHTML;
			if (binding) { return binding; }
		}
		throw "Could not bind " + constructor;
	}; // bindingQueryFromConstructor()


	Bind.bindingQueryFromNode = function(node) {
		if (node.tagName) {
			if (!node.className || node.tagName.match(/\:/)) {
				return node.tagName.toLowerCase();
			} else {
				return node.className;
			}
		}
		return null;
	}; // bindingQueryFromNode


	Bind.getConstructor = function(binding) {
		return Bind.Classes[binding];
	}; // getConstructor()


	Bind.getBindings = function(constructor) {
		var rv = [];
		for (var i in Bind.Classes) {
			if (Bind.Classes[i] === constructor
				|| Bind.Classes[i] === constructor.__constructor
			) {
				rv.push(i);
			}
		}

		return rv;
	}; // getBindings()

	Bind.makeNodeFrom = function(o, collectionType) {
		if (isa(o, Node) || isa(o, Element)) {
			return o;
		}

		if (isa(o, Array)) {
			var rv = document.createElement('div');
			Bind.addArrayAsChildren(rv, o);
			return rv;
		}

		if (typeof(o) != 'object') {
			var rv = document.createElement('div');
			rv.innerHTML = o;
			return rv;
		}

		var constructor = null;
		if (collectionType) {
			constructor = Bind.getConstructor(collectionType);
		}

		if (typeof(o.__types) == 'object') {
			var types = TG.getTypeArray(o);
			for (var i = 0; i < types.length; i++) {
				constructor = Bind.getConstructor(types[i]);
			}
		}

		if (constructor) {
			return New(constructor, o);
		}

		var node = document.createElement('div');
		node.innerHTML = o;
		return node;
	}; 

	Bind.addArrayAsChildren = function(node, values, collectionType) {
		while (node.firstChild) node.removeChild(node.firstChild);
		for (var i = 0; i < values.length; i++ ) {
			values[i] = Bind.makeNodeFrom(values[i], collectionType);
			if (values[i].parentNode) values[i].parentNode.removeChild(values[i]);
			node.appendChild(values[i]);
		};
	}; // addArrayAsChildren()

	Bind.childNodeArray = function(node) {
		var rv = [];
		rv.events = {};

		var collectionType = node['data-collection'] || node.getAttribute('data-collection');

		rv.render = function() {
			// todo: optimize / apply delta
			Bind.addArrayAsChildren(node, rv);
		};

		rv.loadFromDOM = function(newNode) {
			if (newNode) node = newNode;
			var childNodes = [];

			var childType = node['data-collection']
				|| node.getAttribute('data-collection');

			if (childType) {
				childNodes = getNodes(node, childType);
			} else {
				childNodes = Array.prototype.slice.call(node.childNodes);
			}

			rv.length = 0;

			childNodes.forEach(function(child) {
				rv.push(child);
			});
		}; 

		rv.push = function(v) {
			var n = Bind.makeNodeFrom(v, collectionType);
			node.appendChild(n);
			return Array.prototype.push.call(rv, n);
		};

		rv.pop = function() {
			node.removeChild(n);
			return Array.prototype.pop.apply(rv);
		};

		rv.shift = function() {
			node.removeChild(n);
			return Array.prototype.shift.apply(rv);
		};

		rv.unshift = function(v) {
			var n = Bind.makeNodeFrom(v, collectionType);
			node.insertBefore(n, node.firstChild);
			return Array.prototype.unshift.call(rv, n);
		};

		rv.splice = function() {
			var params = Array.prototype.slice.call(arguments, 0);
			var index = params.shift();
			var count = params.shift() || rv.length;
			var newItems = params || [];

			for (var i = index; i < index + count; i++) {
				var n = rv[i];
				node.removeChild(n);
			}

			var insertBeforeNode = rv[i];
			newItems.forEach(function(item) {
				node.insertBefore(item, insertBeforeNode);
			});

			return Array.prototype.splice.apply(rv, arguments);
		};

		var modifiers = [
			// 'push', 'pop', 'shift', 'unshift',
			// 'slice'
			// 'splice',
			'reverse', 'sort'
		];

		for (var i = 0; i < modifiers.length; i++) { (function() {
			var m = modifiers[i];
			rv[m] = function() {
				var r = Array.prototype[m].apply(rv, arguments);
				rv.render();
				return r;
			}
		})(); }

		rv.loadFromDOM();

		return rv;
	}; // childNodeArray()

	Bind.defineAccessors = function(node, obj, id) {
		var descriptor = Object.getOwnPropertyDescriptor(obj, id);
		if (descriptor && descriptor.configurable == false) {
			return;
		}

		if (node.__accessorDefined) {
			return;
		}
		Object.defineProperty(node, '__accessorDefined', {
			get: function() { return true; },
			enumerable: false
		});

		var existing_value = obj[id];

		var default_property = 'innerHTML';
		if (typeof(node.value) == 'string') {
			default_property = 'value';
		}
		var target_property = node.getAttribute('data-property');
		var render_async = node.getAttribute('data-render-async') != null;
		var last_set = target_property;
		var childCollection = Bind.childNodeArray(node);

		obj.__dom = obj.__dom || {};
		Object.defineProperty(obj.__dom, id, {
			get: function() { return node; }
		});

		Object.defineProperty(obj, '__dom', {
			enumerable: false
		});

		var enumerable = true;
		if (node['data-ignore'] || node.getAttribute('data-ignore')) {
			enumerable = false;
		}

		Object.defineProperty(obj, id, {
			get: function() {
				if (target_property == 'children'
					|| last_set == 'children'
					|| node['data-collection']
					|| node.getAttribute('data-collection')
				) {
					return childCollection;
				} else if (target_property) {
					return node[target_property];
				} else if (last_set) {
					return node[last_set];
				} else {
					return node;
				}
			},
			set: function(v) {
				var setThisValue = function(vv) {
					if (isa(vv, Array)) {
						Bind.addArrayAsChildren(node, vv);
						last_set = 'children';
					} else if (isa(vv, Node)) {
						if (node.parentNode) node.parentNode.replaceChild(vv, node);
						node = vv;
						last_set = null;
					} else if (isa(vv, Object)) {
						for (var vv_k in vv) {
							node[vv_k] = vv[vv_k];
						}
						last_set = null;
					} else if (target_property) {
						node[target_property] = vv;
						last_set = target_property;
					} else {
						node[default_property] = vv;
						last_set = default_property;
					}
				}; // setThisValue()

				if (isa(v, 'TG.Value')) {
					on(v, 'change', function() {
						setThisValue(v.valueOf());
					});
				}

				setThisValue(v.valueOf());
				childCollection.loadFromDOM(node);
			},
			enumerable: enumerable,
			configurable: false
		});

	}; // defineAccessors()

	// attach nodes with a data-id to the object ... o.{data-id}
	Bind.attachIdentifiedChildren = function (o, node) {
		var nodes = (node || o).querySelectorAll('[data-id]');
		nodes = Array.prototype.slice.call(nodes, 0);
		for (var i = 0; i < nodes.length; i++) {
			var id = nodes[i].getAttribute('data-id');
			var initial_value = o[id];
			Bind.defineAccessors(nodes[i], o, id);
			if (initial_value) {
				o[id] = initial_value;
			}
		};
	}; // Bind.attachIdentifiedChildren()


	Bind.importAttributes = function (o, node) {
		var node = node || o;
		if (!o.__attributes_imported
			&& node.attributes && node.attributes.length
		) {
			for (var i = 0; i < node.attributes.length; i++) {
				var a = node.attributes[i];

				// this needs to be thought through and tested more. it may make
				// sense to *always* add the property if it was given on a tag
				// attribute like this.
				if (!o[a.name]) {
					o[a.name] = a.value;
				}
			}
		}
		o.__attributes_imported = true;
	}; // importAttributes()


	Bind.templateFor = function(constructor) {
		return [
			'template',
			'markup',
			'templateMarkup'
		].reduce(function(first_found, property) {
			return first_found || constructor[property];
		}, null);
	}; // templateFor


	Bind.importParameters = function (constructor, o, node) {
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
				}
				o.parameters.push(n);
			}

			if (Bind.templateFor(constructor) != null) {
				o.__holdingDiv = document.createElement('div');
				o.__holdingDiv.style.display = 'none';
				document.body.appendChild(o.__holdingDiv);

				for (var i = 0; i < o.parameters.length; i++) {
					o.__holdingDiv.appendChild(o.parameters[i]);
				}
				// not 100% sure why parameters aren't being bound
				// during the regular Bind() calls, but in some cases they're not:
				Bind(o.__holdingDiv);
			}
		}
		o.__parameters_imported = true;
	}; // importParameters()


	Bind.applyParameters = function (o) {
		if (!o.parameters || !isa(o.parameters, Array) || !o.__holdingDiv) {
			return;
		}
		var nodes = o.parameters;
		for (var i = nodes.length - 1; i >= 0; i--) {
			var id = nodes[i]['data-id'] || nodes[i].getAttribute('data-id');
			if (id) {
				// Bind.copyDefaultAttributes(o[id], nodes[i]);
				o[id] = nodes[i];
			}
		}
		o.__holdingDiv.parentNode.removeChild(o.__holdingDiv);
		delete o.__holdingDiv;
	}; // applyParameters()


	Bind.copyDefaultAttributes = function(from, to) {
		if (!isa(from, Node) || !isa(to, Node)) return;
		for (var i = 0; i < from.attributes.length; i++) {
			var name = from.attributes[i].name;
			if (!to.hasAttribute(name)) {
				to.setAttribute(name, from.attributes[i].value);
				to[name] = from.attributes[i].value;
			}
		}
	};


	Bind.getChildren = function (o, query) {
		if (!o.childNodes) {
			return [];
		}

		var rv = [];

		// not the most efficient solution. but an easy one!
		var _rv = getNodes(o, query);
		for (var i = 0; i < _rv.length; i++) {
			if (_rv[i].parentNode === o) {
				rv.push(_rv[i]);
			}
		}

		return rv;
	}; // getChildren()


	window.getNodes = window.getNodes || function (n, q) {
		var rv;

		if (typeof (q) == 'function') {
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

		q = q.replace(/:/g, '\\:');
		rv = n.querySelectorAll(q);

		for (var i = 0; i < rv.length; i++) {
			Bind.importAttributes(rv[i]);
		}

		return Array.prototype.slice.call(rv, 0);
	}; // getNodes()

} // Bind


this.Build = function (constructor, o) {
	var _o = o || {};
	var n = null;

	for (var i in Bind.Classes) {
		if (Bind.Classes[i] === constructor) {
			n = document.createElement(i, _o);
			break;
		}
	}

	if (n === null) {
		n = o;
		constructor.apply(n);
	}

	return n;
} // Build()
this.New = Build;


console.log('Loaded Bind.');
});

tgmodule.d('./','./tg-namespace.js',function(module){
});

tgmodule.d('./','./tg-upon.js',function(module){
});

tgmodule.d('./','./tg-api.js',function(module){
require('tg-namespace.js');
require('tg-upon.js');

TG.API.longPolls = TG.API.longPolls || [];
TG.API.requests = TG.API.requests || {};
TG.API.APIs = TG.API.APIs || [];

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
		var _make_refs = false;
		rv = TG.stringify(
			new TG.DataObjectReference(o),
			d - 1,
			instance,
			_make_refs	
		);
	} else if (typeof(o) === 'object') {
		var _rv = [];
		var props_written = 0;

		for (var i in o) {
			var omissions = {};
			omissions.__stringify_instance = 1;
			omissions.__parameters_imported = 1;
			omissions.__attributes_imported = 1;
			omissions.__AlreadyBound = 1;
			if (!omissions[i] && o.hasOwnProperty(i) && !i.match(/__TG/)) {
				var v = TG.stringify(o[i], d - 1, instance, make_refs);
				var k = TG.stringify(i, d - 1, instance, make_refs);
				if (k && typeof(v) == 'string') {
					props_written += 1;
					_rv.push(k + ':' + v);
				}
			}

			/*
			if (i == 'childNodes' && o[i].length > 0) {
				var v = TG.stringify(
					Array.prototype.slice.apply(o[i]),
					d - 1,
					instance,
					make_refs
				);
				_rv.push(i + ':' + v);
			}
			*/

			/*
			if (i == 'innerHTML' && o.innerHTML.length > 0) {
				_rv.push(i + ':' + TG.stringify(o.innerHTML));
			}
			*/
		}

		/*
		if (props_written == 0 && o.childNodes) {
			// _rv.push('"innerHTML":' + TG.stringify(o.innerHTML));
			var v = TG.stringify(
				Array.prototype.slice.apply(o.childNodes),
				d - 1,
				instance,
				make_refs
			);
			_rv.push('"childNodes":' + v);
		}
		*/

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


TG.API.requestToken = function(api) {
	var tf = document.createElement('iframe');
	tf.src = api + "?tg-tr=1";
	tf.style.display = 'none';
	document.body.appendChild(tf);
}; // TG.API.requestToken()


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
});

tgmodule.d('./','./tg-upon.js',function(module){
});

tgmodule.d('./','./tg-namespace.js',function(module){
});

tgmodule.d('./','./tg-dom.js',function(module){
});

tgmodule.d('./','./tg-box.js',function(module){
TG.Box = function(x, y, w, h, mt, mr, mb, ml) {
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

}; // TG.Box()

module.exports = TG.Box;
});

tgmodule.d('./','./tg-mouse-coords.js',function(module){
require('tg-box.js');

// TG.MouseCoords
// Determines and stores the Coordinates for a mouse event
TG.MouseCoords = function (event) {
	var e = event || window.event;
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

module.exports = TG.MouseCoords;
});

tgmodule.d('./','./tg-dragdrop.js',function(module){
require('tg-upon.js');
require('tg-namespace.js');
require('tg-dom.js');
require('tg-mouse-coords.js');

upon('Bind', function () {
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
		} else if (window.getComputedStyle) {
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
		var e = evt || window.event;
		var mc = new TG.MouseCoords(e);
		if (TG.DragDrop.grab(mc) && typeof(e.preventDefault) == 'function') {
			e.preventDefault();
		}
	}; // document.onmousedown()

	document.onmousemove = function (evt) {
		var e = evt || window.event;
		var mc = new TG.MouseCoords(e);
		if (TG.DragDrop.drag(mc) && typeof(e.preventDefault) == 'function') {
			e.preventDefault();
		}
	}; // document.onmousemove()

	document.onmouseup = function (evt) {
		var e = evt || window.event;
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
});

tgmodule.d('./','./tg-upon.js',function(module){
});

tgmodule.d('./','./tg-namespace.js',function(module){
});

tgmodule.d('./','./tg-test.js',function(module){
require('tg-upon.js');
require('tg-namespace.js');

TG.Testing || {

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

});

tgmodule.d('./','./tg-upon.js',function(module){
});

tgmodule.d('./','./tg-namespace.js',function(module){
});

tgmodule.d('./','./tg-dom.js',function(module){
});

tgmodule.d('./','./tg-ui.js',function(module){
require('tg-upon.js');
require('tg-namespace.js');
require('tg-dom.js');


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
_bindq.push(TG.UI.SubmitButton, '.tg-submit-button');


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
_bindq.push(TG.UI.Field, '.tg-field');


TG.UI.PasswordField = function() {
	this.type = 'password';
	TG.UI.Field.call(this);
	setType(this, 'TG.UI.PasswordField');
	onready(this).fire();
}; // TG.UI.PasswordField
TG.UI.PasswordField.templateMarkup = TG.UI.Field.templateMarkup;
_bindq.push(TG.UI.PasswordField, '.tg-password-field');


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
_bindq.push(TG.UI.RadioGroup, '.tg-radio-group');


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
_bindq.push(TG.UI.Radio, '.tg-radio');


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
_bindq.push(TG.UI.LoginLink, '.tg-login-link');


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
_bindq.push(TG.UI.LoginBox, '.tg-login-box');


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
_bindq.push(TG.UI.TestRun, '.tg-test-run');


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
		m = "<b>" + this.message.message + "</b>\n"
			+ "<i>" + this.message.fileName + ":"
				+ this.message.lineNumber
			+ "</i>\n"
			+ this.message.stack;
	}
	m = m.replace(/\n/g, "<br />\n");
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
		<td style='width: 25pt; text-align: right;'>\
			<span data-id='reads'>0</span>\
		</td>\
		<td style='width: 8pt'>\
			<span style='color: silver;'>r</span>\
		</td>\
		<td style='width: 25pt; text-align: right;'>\
			<span data-id='writes'>0</span>\
		</td>\
		<td style='width: 8pt'>\
			<span style='color: silver;'>w</span>\
		</td>\
		<td style='width: 25pt; text-align: right;'>\
			<span data-id='deletes'>0</span>\
		</td>\
		<td style='width: 8pt'>\
			<span style='color: silver;'>d</span>\
		</td>\
	</tr></table>\
";
_bindq.push(TG.UI.TestResult, '.tg-test-result');

});

tgmodule.d('./','./tg-namespace.js',function(module){
});

tgmodule.d('./','./tg-mainloop.js',function(module){
require('tg-namespace.js');

//
// TG namespace
//

TG.MainLoop = function() {
	// for computing "utilization"
	var _S = new Date();
	var _o = TG.MainLoop.objects;
	var f = TG.MainLoop.functions;


	// remove "dead" objects
	var o = [];
	for (var i in _o) {
		if (_o[i].dead == false) {
			o.push(_o[i]);
		}
	}
	TG.MainLoop.objects = o;

	// step loop
	for (var i in o) {
		o[i].step();
	}
	
	// draw loop
	for (var i in o) {
		o[i].draw();
	}

	
	// run plugins
	for (var i in f) {
		if (typeof(f[i]) == 'function') {
			f[i]();
		}
	}


	//
	// benchmarking / utilization guesstimating.
	// this is highly inaccurate at the moment. may have to introduce
	// a multiplier to estimate CPU time used outside MainLoop ... or
	// just find a way to track CPU time outside MainLoop.
	//

	var stats = document.getElementById('__stats');
	if (stats) {
		var ml = TG.MainLoop;
		var _E1 = ml.__endLastRun;
		var _E1_t = _E1.getTime();
		var _E2 = new Date();
		var _E2_t = _E2.getTime();

		var _period = ml.__period + _E2_t - _E1_t;
		if (_S.getTime() - ml.__startLastRun.getTime() > 1000 / ml.__fps) {
			var _runtime = ml.__runtime + (_E2_t - _E1_t)/2;
		} else {
			var _runtime = ml.__runtime + (_E2_t - _S.getTime());
		}

		if (_period >= 1000) {
			var _util = _runtime / Math.max(1, _period);
			stats.innerHTML = _runtime + "/" + _period + " = " + String(Math.round(_util * 100)) + "%";
			_runtime = 0;
			_period = 0;
		}

		ml.__period = _period;
		ml.__runtime = _runtime;
		ml.__endLastRun = _E2;
		ml.__startLastRun = _S;
	}
} // TG.MainLoop()
TG.MainLoop.__fps = 30;
TG.MainLoop.__interval = null;
TG.MainLoop.__startLastRun = new Date();
TG.MainLoop.__endLastRun = new Date();
TG.MainLoop.__period = 0;
TG.MainLoop.__runtime = 0;
TG.MainLoop.objects = [];
TG.MainLoop.functions = [];

TG.MainLoop.running = function() {
	return TG.MainLoop.__interval;
} // TG.MainLoop.running()

TG.MainLoop.addFunction = function(f) {
	if (typeof(f) == 'function') {
		var m = TG.MainLoop;
		var mf = m.functions;
		for (var i in mf) {
			if (f == mf[i]) {
				return true;
			}
		}
		mf.push(f);
		m.start();
		return true;
	} else {
		return false;
	}
} // TG.MainLoop.addFunction()

TG.MainLoop.addObject = function(o) {
	if (typeof(o) == 'object'
		&& o['step'] && typeof(o['step']) == 'function'
		&& o['draw'] && typeof(o['draw']) == 'function'
	) {
		var m = TG.MainLoop;
		var mo = m.objects;
		for (var i in mo) {
			if (o == mo[i]) {
				return true;
			}
		}
		mo.push(o);
		m.start();
		return true;
	} else {
		return false;
	}
} // TG.MainLoop.addObject()

TG.MainLoop.removeFunction = function(f) {
	var mf = TG.MainLoop.functions;
	for (var i = 0; i < mf.length; i++) {
		if (mf[i] == f) {
			mf.splice(i, 1);
			return;
		}
	}
} // TG.MainLoop.removeFunction()

TG.MainLoop.removeObject = function(o) {
	var mo = TG.MainLoop.objects;
	for (var i = 0; i < mo.length; i++) {
		if (mo[i] == o) {
			mo.splice(i, 1);
			return;
		}
	}
} // TG.MainLoop.removeObject()

TG.MainLoop.start = function(fps) {
	if (!TG.MainLoop.__interval) {
		TG.MainLoop.__fps = fps || TG.MainLoop.__fps;
		TG.MainLoop.__interval = setInterval(function() { TG.MainLoop(); }, 1000 / TG.MainLoop.__fps);
	}
} // TG.MainLoop.start()

TG.MainLoop.stop = function() {
	TG.MainLoop.__interval = clearInterval(TG.MainLoop.__interval);
} // TG.MainLoop.stop()

TG.MainLoop.pause = function() {
	return TG.MainLoop.stop();
} // TG.MainLoop.pause()


var insertAfter = function(new_node, existing_node) {
	if (existing_node.nextSibling) {
		existing_node.parentNode.insertBefore(new_node, existing_node.nextSibling);
	} else {
		existing_node.parentNode.appendChild(new_node);
	}
} // insertAfter()


// process the run-queue, if there is one
if (this['__tgq']) {
	this['__tgq'].push = function (f) {
		if (typeof(f) == 'function') {
			f();
		}
	}
	for (var i in this['__tgq']) {
		if (typeof(this['__tgq'][i]) == 'function') {
			this['__tgq'][i]();
		}
	}
} else {
	this['__tgq'] = {
		push : function (f) {
			f();
		}
	}
}
});

tgmodule.setpath('.');
require('tg-upon.js');
require('tg-dom.js');
require('tg-api.js');
require('tg-dragdrop.js');
require('tg-test.js');
require('tg-ui.js');
require('tg-mainloop.js');
