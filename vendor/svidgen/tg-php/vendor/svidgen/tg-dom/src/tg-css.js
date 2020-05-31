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
