function MainLoop() {
	// for computing "utilization"
	var _S = new Date();
	var _o = MainLoop.objects;
	var f = MainLoop.functions;


	// remove "dead" objects
	var o = [];
	for (var i = 0; i < _o.length; i++) {
		if (!_o[i].dead) {
			o.push(_o[i]);
		}
	}
	MainLoop.objects = o;

	// step loop
	for (var i = 0; i < o.length; i++) {
		o[i].step();
	}
	
	// draw loop
	for (var i = 0; i < o.length; i++) {
		o[i].draw();
	}

	
	// run plugins
	for (var i = 0; i < f.length; i++) {
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
		var ml = MainLoop;
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
}

MainLoop.__fps = 30;
MainLoop.__interval = null;
MainLoop.__startLastRun = new Date();
MainLoop.__endLastRun = new Date();
MainLoop.__period = 0;
MainLoop.__runtime = 0;
MainLoop.objects = [];
MainLoop.functions = [];

MainLoop.running = function() {
	return MainLoop.__interval;
} // TPDC.MainLoop.running()

MainLoop.addFunction = function(f) {
	if (typeof(f) == 'function') {
		var m = MainLoop;
		var mf = m.functions;
		for (var i = 0; i < mf.length; i++) {
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
} // TPDC.MainLoop.addFunction()

MainLoop.addObject = function(o) {
	if (typeof(o) == 'object'
		&& o.step && typeof(o.step) == 'function'
		&& o.draw && typeof(o.draw) == 'function'
	) {
		var m = MainLoop;
		var mo = m.objects;
		for (var i = 0; i < mo.length; i++) {
			if (o === mo[i]) {
				return true;
			}
		}
		mo.push(o);
		m.start();
		return true;
	} else {
		return false;
	}
} // TPDC.MainLoop.addObject()

MainLoop.removeFunction = function(f) {
	var mf = MainLoop.functions;
	for (var i = 0; i < mf.length; i++) {
		if (mf[i] === f) {
			mf.splice(i, 1);
			return;
		}
	}
} // TPDC.MainLoop.removeFunction()

MainLoop.removeObject = function(o) {
	var mo = MainLoop.objects;
	for (var i = 0; i < mo.length; i++) {
		if (mo[i] === o) {
			mo.splice(i, 1);
			return;
		}
	}
} // TPDC.MainLoop.removeObject()

MainLoop.start = function(fps) {
	if (!MainLoop.__interval) {
		MainLoop.__fps = fps || MainLoop.__fps;
		MainLoop.__interval = setInterval(function() { MainLoop(); }, 1000 / MainLoop.__fps);
	}
} // TPDC.MainLoop.start()

MainLoop.stop = function() {
	MainLoop.__interval = clearInterval(MainLoop.__interval);
} // TPDC.MainLoop.stop()

MainLoop.pause = function() {
	return MainLoop.stop();
} // TPDC.MainLoop.pause()


module.exports = {
	MainLoop
};