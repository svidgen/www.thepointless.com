(function() {
	QUnit.module('utils');

	QUnit.test("observe() fires not callback when no change", function(assert) {
		var o = {'abc': 123};
		var observed = false;
		TG.observe(o, ['abc'], function() { observed = true; });
		assert.ok(!observed, "observe callback was not made");
	});

	QUnit.test("observe() fires callback when property changes", function(assert) {
		var o = {'abc': 123};
		var observed = false;
		TG.observe(o, ['abc'], function() { observed = true; });
		o.abc = 456;
		assert.ok(observed, "observe callback was made");
	});

	QUnit.test("observe() callback gets object, prop, val", function(assert) {
		var o = {'abc': 123};
		var observed_data = null;
		TG.observe(o, ['abc'], function(o, name, value) {
			observed_data = {o: o, name: name, value: value};
		});
		o.abc = 456;
		assert.equal(observed_data.o, o, "gets object as first arg");
		assert.equal(observed_data.name, 'abc', "gets prop name as 2nd arg");
		assert.equal(observed_data.value, 456, "gets prop value as 3rd arg");
	});

})();
