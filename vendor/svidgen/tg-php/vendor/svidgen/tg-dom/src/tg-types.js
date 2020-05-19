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
