require('tg-namespace.js');

TG.observe = function(o, props, f, enumerable) {
	var enumerable = enumerable === undefined ? true : enumerable;
	props.forEach(function(p) {
		var innerValue = o[p];
		Object.defineProperty(o, p, {
			set: function(v) {
				innerValue = v;
				f(o, p, v);
			},
			get: function() {
				return innerValue;
			},
			enumerable: enumerable
		});
	});
};
module.exports = TG.observe;
