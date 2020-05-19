upon = function(test, fn) {
	if (typeof(test) == 'function' && test()) {
		fn();
	} else if (typeof(test) == 'string' && window[test]) {
		fn();
	} else {
		setTimeout(function() { upon(test, fn); }, 50);
	}
}; // upon()

