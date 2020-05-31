require('tg-upon.js');
require('tg-namespace.js');

TG.Testing || {

	Test: function(name, test) {
		this.name = name;
		this.test = function() {
			var rv;
			try {
				test();
				rv = {
					success: true,
					name: name,
					message: ""
				};
			} catch (ex) {
				rv = {
					success: false,
					name: name,
					message: TG.stringify(ex)
				};
			}

			return rv;
		}; // test()
		setType(this, 'TG.Testing.Test');
	},

	FakeDisk: function(storage) {

		var storage = storage || {};
		var backup = {};

		this.build = function() {
			backup.tg_save = tg_save;
			backup.tg_retrieve = tg_retrieve;
			backup.tg_delete = tg_delete;

			tg_save = function(js) {
				// var id = tg_save(TG.stringify(_t, null, null, true));
				eval('var o = ' + js);
				if (!o['tg-id']) {
					o['tg-id'] = 'MEM-' + (new Date()).getTime() + '.' + Math.random();
				}
				var id = o['tg-id'];
				storage[id] = TG.stringify(o, null, null, true);
				return id;
			}; // TEMP tg_save()

			tg_retrieve = function(id) {
				return storage[id];
			}; // TEMP tg_retrieve()

			tg_delete = function(id) {
				delete storage[id];
			}; // TEMP tg_delete()
		}; // build()

		this.dispose = function() {
			tg_save = backup.tg_save;
			tg_retrieve = backup.tg_retrieve;
			tg_delete = backup.tg_delete;
		}; // destroy

		this.build();

		setType(this, 'TG.Testing.FakeDisk');
	}, // TG.Testing.FakeDisk

	Suite: function() {
		TG.DataObject.apply(this);

		this.suite = arguments;
		this.run = function() {
			var disk = new TG.Testing.FakeDisk();

			var rv = { passed: [], failed: [] };
			for (var i = 0; i < this.suite.length; i++) {
				var t = this.suite[i];

				if (i == 0 && t && typeof(t) == 'string') {
					eval.call(global, tg_readfile(t));
				} else if (isa(t, 'TG.Testing.Test')) {
					var r = t.test();
					if (r.success) {
						rv.passed.push(r);
					} else {
						rv.failed.push(r);
					}
				}
			}

			disk.dispose();

			return rv;
		}; // run()

		setType(this, 'TG.Testing.Suite');
	}

}; // TG.Testing


TG.assert = function(passed, failure_description) {
	if (!passed) {
		throw String(failure_description);
	}
}; // TG.assert()

