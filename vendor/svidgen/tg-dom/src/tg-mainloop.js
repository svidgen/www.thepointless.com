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
