(function() {

	var TestAPI = TG.TestAPI;

	var fixture = document.getElementById('qunit-fixture');

	QUnit.module("tg-integration");

	QUnit.test("Our test service/object is present", function(assert) {
		assert.ok(TestAPI, "the service object is present");
		assert.ok(isa(TestAPI, Object), "the service object is an object");
		assert.ok(isa(TestAPI.returnTrue, Function),
			"the service object has methods"
		);
	});

	QUnit.test("We can retrieve `true` as a Boolean", function(assert) {
		var done = assert.async();
		TestAPI.returnTrue().and(function(rv) {
			assert.ok(1, "returnTrue() returned");
			assert.strictEqual(rv, true, "`true` was returned");
			done();
		});
	});

	QUnit.test("We can retrieve `false` as a Boolean", function(assert) {
		var done = assert.async();
		TestAPI.returnFalse().and(function(rv) {
			assert.ok(1, "returnFalse() returned");
			assert.strictEqual(rv, false, "`false` was returned");
			done();
		});
	});

	QUnit.test("Null return values are actually `null`", function(assert) {
		var done = assert.async();
		TestAPI.returnNull().and(function(rv) {
			assert.ok(1, "returnNull() returned");
			assert.strictEqual(rv, null, "`null` was returned");
			done();
		});
	});

	QUnit.test("Methods with no return statement return `null`", function(assert) {
		var done = assert.async();
		TestAPI.returnNothing().and(function(rv) {
			assert.ok(1, "returnNothing() returned");
			assert.strictEqual(rv, null, "`null` was returned");
			done();
		});
	});

	QUnit.test("We can retrieve 1 as a Number", function(assert) {
		var done = assert.async();
		TestAPI.returnOne().and(function(rv) {
			assert.ok(1, "returnOne() returned");
			assert.strictEqual(rv, 1, "`1` was returned");
			done();
		});
	});

	QUnit.test("We can retrieve a Number other than 1 or 0", function(assert) {
		var done = assert.async();
		TestAPI.returnTwo().and(function(rv) {
			assert.ok(1, "returnTwo() returned");
			assert.strictEqual(rv, 2, "`2` was returned");
			done();
		});
	});

	QUnit.test("We can retrieve 0's of type Number", function(assert) {
		var done = assert.async();
		TestAPI.returnZero().and(function(rv) {
			assert.ok(1, "returnZero() returned");
			assert.strictEqual(rv, 0, "`0` was returned");
			done();
		});
	});

	QUnit.test("We can retrieve strings", function(assert) {
		var done = assert.async();
		TestAPI.returnString().and(function(rv) {
			assert.ok(1, "returnString() returned");
			assert.strictEqual(rv, 'value', "`value` was returned");
			done();
		});
	});

	QUnit.test("We can retrieve objects", function(assert) {
		var done = assert.async();
		TestAPI.returnObject().and(function(rv) {
			assert.ok(1, "returnObject() returned");
			assert.ok(isa(rv, Object), "an Object was returned");
			assert.strictEqual(rv.a, 1, "expected properties were returned with it");
			done();
		});
	});

	QUnit.skip("We can fetch properties of a global service/object", function(assert) {
		var done = assert.async();
		TestAPI.getCount().and(function(rv) {
			assert.ok(1, "getCount() returned");
			assert.ok(rv > 100, "counter is present");
			done();
		});
	});

	QUnit.skip("Methods that are intended to modify and save values actually do so", function(assert) {
		var done = assert.async();
		var t = TestAPI;
		var c;
		t.getCount()
			.and(function(rv) {
				assert.ok(rv, "an initial count was returned");
				c = rv;
				return t.increment();
			})
			.and(function(rv) {
				assert.ok(rv, "increment also returned a count");
				assert.ok(rv > c, "the incremented count is bigger");
				return t.getCount();
			})
			.and(function(rv) {
				assert.ok(rv > c, "subsequent getCount() is also bigger than the original getCount()");
				done();
			})
		;
	});

	QUnit.test("Parameters can be sent to server objects", function(assert) {
		var done = assert.async();
		var rem = 9;
		var ok = function() { rem--; if (rem <= 0) { done(); } };

		TestAPI.echoArg('charlie').returnTo(function(rv) {
			assert.strictEqual(rv, 'charlie', "Strings are OK");
			ok();
		});

		TestAPI.echoArg(0).returnTo(function(rv) {
			assert.strictEqual(rv, 0, "Number 0 is OK");
			ok();
		});

		TestAPI.echoArg(1).returnTo(function(rv) {
			assert.strictEqual(rv, 1, "Number 1 id OK");
			ok();
		});

		TestAPI.echoArg(123).returnTo(function(rv) {
			assert.strictEqual(rv, 123, "Numbers > 1 are OK");
			ok();
		});
		
		TestAPI.echoArg(-123).returnTo(function(rv) {
			assert.strictEqual(rv, -123, "Numbers < 0 are OK");
			ok();
		});
		
		TestAPI.echoArg(true).returnTo(function(rv) {
			assert.strictEqual(rv, true, "Boolean (true) is OK");
			ok();
		});

		TestAPI.echoArg(3.141).returnTo(function(rv) {
			assert.strictEqual(rv, 3.141, "Float (3.141) is OK");
			ok();
		});

		TestAPI.echoArg(null).returnTo(function(rv) {
			assert.strictEqual(rv, null, "null is OK");
			ok();
		});

		TestAPI.echoArg({a:1,b:'two'}).returnTo(function(rv) {
			assert.strictEqual(rv.a, 1, "Object property a:1 is OK");
			assert.strictEqual(rv.b, 'two', "Object property b:'two' is OK");
			ok();
		});

	});

	QUnit.skip("Return object methods are invocable", function(assert) {
		var done = assert.async();
		TestAPI.getInvocable().returnTo(function(rv) {
			assert.ok(rv, 'a return value was given');
			assert.ok(isa(rv, Object), "the return value is an object");
			assert.ok(isa(rv.invoke, Function), "the `invoke` property is a function");
			try {
				rv.invoke().returnTo(function(rv) {
					assert.ok(true, "the return object method returned");
					assert.equal(rv, "monkey farts", "the correct value was returned");
					done();
				});
			} catch (ex) {
				done();
				throw ex;
			}
		});
	});

})();
