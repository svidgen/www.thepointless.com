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

