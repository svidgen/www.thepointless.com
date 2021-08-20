function MainLoop() {
	// for computing "utilization"
	const now = new Date();
	const elapsed_ms = MainLoop.__lastTime ? (now - MainLoop.__lastTime) : 0;
	const elapsed = elapsed_ms / 1000;
	MainLoop.__lastTime = now;

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
		o[i].step({now, elapsed, elapsed_ms});
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

	if (MainLoop.__interval) {
		requestAnimationFrame(() => MainLoop());
	}
}

MainLoop.__fps = 30;
MainLoop.__interval = null;
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
		MainLoop.__interval = true;
		requestAnimationFrame(() => MainLoop());
	}
} // TPDC.MainLoop.start()

MainLoop.stop = function() {
	MainLoop.__interval = null;
} // TPDC.MainLoop.stop()

MainLoop.pause = function() {
	return MainLoop.stop();
} // TPDC.MainLoop.pause()


module.exports = {
	MainLoop
};
