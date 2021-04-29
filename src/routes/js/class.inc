var $Class = function(classname, json, base) {
	if (json[classname] && typeof(json[classname]) == 'function') {
		var o = json[classname];
		delete json[classname];
	} else {
		var o = function() {};
	}

	// this produces much more efficient method calls than directly
	// assigning o.prototype = json;
	// why? ... no idea.
	for (var i in json) {
		o.prototype[i] = json[i];
	}

	if (base && typeof(base) == 'function') {

		var wrap = function(f) {
			return function() {
				var s = this.$super;
				this.$super = this.$super.$super;
				var rv = f.apply(this, arguments);
				this.$super = s;
				return rv;
			}
		}

		o.prototype.$super = {};
		for (var i in base.prototype) {

			if (typeof(base.prototype[i]) == 'function') {
				var t = base.prototype[i];
				o.prototype.$super[i] = wrap(t);
			} else {
				o.prototype.$super[i] = base.prototype[i];
			}

			if (!o.prototype[i]) {
				o.prototype[i] = o.prototype.$super[i];
			}

		}
	}

	return o;
} // $Class
