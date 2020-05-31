TGProfiler = new function() {

	var profiles = {}

	this.start = function(name) {
		return new Profile(name);
	};

	this.watch = function(name, f) {
		return function() {
			var profile = new Profile(name);
			var rv = f.apply(this, Array.prototype.slice.call(arguments, 0));
			profile.stop();
			return rv;	
		}
	};

	this.append = function(profile) {
		profiles[profile.name] = profiles[profile.name] || [];
		profiles[profile.name].push(profile);
	};

	this.getSummary = function() {
		var rv = {};
		for (var name in profiles) {
			_profiles = profiles[name];
			rv[_profiles[0].name] = {
				count: _profiles.length,
				time: _profiles.reduce(function(sum, profile) {
					return sum + profile.getTime() ;
				}, 0)
			};
		}
		return rv;
	};

};

var Profile = function(name) {

	var start, end;

	this.init = function() {
		this.name = name;
		TGProfiler.append(this);
		start = new Date();
	};

	this.stop = function() {
		end = new Date();
	};

	this.getTime = function() {
		if (end) {
			return end.getTime() - start.getTime();
		} else {
			return (new Date()).getTime() - start.getTime();
		}
	};

	this.init();
}

module.exports = TGProfiler;


