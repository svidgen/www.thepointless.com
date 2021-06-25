function print_r(v, d) {
	var maxdepth = 10;
	d = d || 0;
	var indent = "";

	for (var i = 0; i < d; i++) {
		indent += "  ";
	}

	var rv = "";

	if (typeof(v) == 'string') {
		rv += indent + '"' + v + '"';
	} else if (typeof(v) == 'number' || typeof(v) == 'boolean') {
		rv += indent + v.toString();
	} else if (typeof(v) == 'object' || typeof(v) == 'array') {
		if (d < maxdepth) {
			for (var i in v) {
				rv += indent + i + ": {\n" + print_r(v[i], d + 1) + "\n" + indent + "}\n";
			}
		} else {
			rv += indent + "{" + typeof(v) + "\n" + indent + "}\n";
		}
	} else {
		rv += indent + "{" + typeof(v) + "\n" + indent + "}\n";
	}

	return rv;
} // print_r()

