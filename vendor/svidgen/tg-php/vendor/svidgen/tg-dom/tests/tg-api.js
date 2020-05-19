(function() {

	QUnit.module("tg-api");


	//
	// testing mockers
	//

	// only works with multijsonp() and other methods that explicitly check for
	// this mock.
	var mockAjax = function(responses) {

		window.MockXMLHttpRequest = function() {
			var _t = this;

			this.log = [];

			this.open = function() {
				var l = Array.prototype.slice.call(arguments);
				l.unshift('open');
				this.log.push(l);
			};

			this.setRequestHeader = function() {
				var l = Array.prototype.slice.call(arguments);
				l.unshift('setRequestHeader');
				this.log.push(l);
			}; 

			this.send = function(data) {
				this.data = data;
				var l = Array.prototype.slice.call(arguments);
				l.unshift('send');
				this.log.push(l);
				var response = mockAjax.responses.shift();
				setTimeout(function() {
					if (response) {
						_t.readyState = 4;
						_t.status = 200;
						_t.responseText = _t.responseToJSONP(response);
						if (typeof(_t.onreadystatechange) == 'function') {
							_t.onreadystatechange();
						}
					}
				}, 1);
			};

			this.abort = function() {
				this.log.push('abort');
			};

			this.responseToJSONP = function(r) {
				// var requestNumber = mockAjax.requestNumber;
				// mockAjax.requestNumber++;
				var requestNumber = 0;
				var token = this.getToken(this.data);
				var jsonp = "TG.API.cb('"
					+ token + "'," + requestNumber + "," + TG.stringify(r)
				+ ");";
				return jsonp;
			}; 

			this.getToken = function(data) {
				var tokenMatches = data.match(/tg-t=(.*)&/);
				return tokenMatches[1];
			}; 

			mockAjax.requests.push(this);
		}; 

		TG.API._requestToken = TG.API.requestToken;
		TG.API.requestToken = function(api) {
			TG.API[api] = {t: ['1','1','1','1','1','1','1','1','1','1']};
		};

		// mockAjax.requestNumber = 0;
		mockAjax.requests = [];
		mockAjax.responses = responses || [];

	}; // mockAjax()

	var unmockAjax = function() {
		delete window.MockXMLHttpRequest;
		delete mockAjax.requests;
		delete mockAjax.responses;
		delete mockAjax.requestNumber;
		TG.API.requestToken = TG.API._requestToken;
	}; // unmockAjax()


	//
	// TG.stringify
	//

	QUnit.test("TG.stringify(null)", function(assert) {
		var o = null;
		var expected = "null";
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify(undefined)", function(assert) {
		var o = undefined;
		var expected = undefined;
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify('')", function(assert) {
		var o = '';
		var expected = '""';
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify(123)", function(assert) {
		var o = 123;
		var expected = '123';
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify('abc')", function(assert) {
		var o = 'abc';
		var expected = '"abc"';
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify('123')", function(assert) {
		var o = '123';
		var expected = '"123"';
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify([])", function(assert) {
		var o = [];
		var expected = "[]";
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify([1])", function(assert) {
		var o = [1];
		var expected = "[1]";
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify([1,2,3])", function(assert) {
		var o = [1,2,3];
		var expected = "[1,2,3]";
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify([{a:1},{b:2},{c:3}])", function(assert) {
		var o = [{a:1},{b:2},{c:3}];
		var expected = '[{"a":1},{"b":2},{"c":3}]';
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify({})", function(assert) {
		var o = {};
		var expected = "{}";
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify({a:1})", function(assert) {
		var o = {a:1};
		var expected = '{"a":1}';
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify({a:1,b:{c:2},d:[1,2,3,'four']})", function(assert) {
		var o = {a:1,b:{c:2},d:[1,2,3,'four']};
		var expected = '{"a":1,"b":{"c":2},"d":[1,2,3,"four"]}';
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected);
	});

	QUnit.test("TG.stringify([b:{a:1},{a:1}])", function(assert) {
		var a = {a:1};
		var b = {b:a};
		var o = [b,a];
		var expected = '[{"b":{"a":1}},{"a":1}]';
		var actual = TG.stringify(o);
		assert.strictEqual(actual, expected, "An object that appears multiple times in the hierarchy is serialized multiple times when it's not its own descendent.");
	});


	//
	// TG.applyTypesFrom()
	//

	TestClass = function() {
		this.value = 0;
		this.increment = function() {
			this.value += 1;
		};
		setType(this, 'TestClass');
	}; // TestClass

	var testTestClass = function(o, startValue, assert) {
		var endValue = Number(startValue) + 1;
		assert.ok(isa(o, 'TestClass'), "o identifies as a TestClass");
		assert.equal(o.value, startValue, "o.value is initially " + startValue);
		o.increment();
		assert.equal(o.value, endValue, "o.value properly increments by 1 to " + endValue);
	}; // testTestClass()

	QUnit.test("TG.getTypeArray() returns an array of explicit type names", function(assert) {
		var o = {};
		setType(o, 'a');
		setType(o, 'b');
		setType(o, 'c');
		var types = TG.getTypeArray(o);
		assert.ok(isa(types, Array), "an array was returned");
		assert.equal(types.length, 3, "the currect number of types were returned");
		assert.equal(types[0], 'a');
		assert.equal(types[1], 'b');
		assert.equal(types[2], 'c');
	});

	QUnit.test("TestClass identifies itself and manages its value properly", function(assert) {
		var o = new TestClass();
		testTestClass(o, 0, assert);
	});

	QUnit.test("TG.applyTypesFrom(new TestClass(), {}) applies all constructors listed on p1 to p2", function(assert) {
		var o = new TestClass();
		o.increment();
		var n = {};
		TG.applyTypesFrom(o, n);
		testTestClass(n, 0, assert);
	});

	QUnit.test("TG.copy(new TestClass(), {}) copies fields and types from p1 to p2", function(assert) {
		var o = new TestClass();
		o.increment();
		var n = {};
		TG.copy(o, n);
		testTestClass(n, 1, assert);
	});

	QUnit.test("TG.copy(new TestClass(), {}) leaves 'additional' fields on p2 intact", function(assert) {
		var o = new TestClass();
		o.increment();
		var n = { p2value: 123 };
		TG.copy(o, n);
		testTestClass(n, 1, assert);
		assert.ok(n.p2value, "additional fields from p2 still exist");
		assert.equal(n.p2value, 123, "additional fields from p2 retain their value");
	});

	QUnit.test("TG.copy() applies all constructors to the target (p2) that the source (p1) claims to have types", function(assert) {
		var o = new TestClass();
		var s = TG.stringify(o);
		eval("var o2 = " + s);
		var n = {};
		TG.copy(o2, n);
		testTestClass(n, 0, assert);
	});

	QUnit.test("TG.copy() recurses (is that a word?)", function(assert) {
		var a = new TestClass();
			a.b = new TestClass();

		var o = {
			a: a,
			c: new TestClass()
		};

		var n = {};
		TG.copy(o, n);

		assert.ok(n.a && n.a.b && n.c, "all properties were properly copied");
		testTestClass(n.a, 0, assert);
		testTestClass(n.c, 0, assert);
		testTestClass(n.a.b, 0, assert);

	});

	QUnit.test("TG.copy() recurses when the source only 'claims' to have types", function(assert) {
		var a = new TestClass();
			a.b = new TestClass();

		var o = {
			a: a,
			c: new TestClass()
		};

		var s = TG.stringify(o);
		eval("var o2 = " + s);

		var n = {};
		TG.copy(o2, n);

		assert.ok(n.a && n.a.b && n.c, "all properties were properly copied");
		testTestClass(n.a, 0, assert);
		testTestClass(n.c, 0, assert);
		testTestClass(n.a.b, 0, assert);

	});

	WeirdThing = function() {
		var rv = {
			i: "am weird"
		};
		setType(rv, 'WeirdThing');
		return rv;
	};

	QUnit.test("TG.copy() places the return-value of 'constructors' in their property locations when a return-value is given", function(assert) {
		var o = { a: 1, b: 2, x: { c: 3} };
		setType(o.x, 'WeirdThing');

		var n = {};
		TG.copy(o, n);

		assert.equal(n.a, 1, "property `a` was correctly reapplied");
		assert.equal(n.b, 2, "property `b` was correctly reapplied");
		assert.ok(n.x, "property `x` exists");
		assert.ok(isa(n.x, 'WeirdThing'), "`x` exists and is a 'WeirdThing'");
		assert.equal(n.x.i, "am weird", "property `x.i` is 'am weird'");
		assert.equal(n.x.c, 3, "property `x.c` is 3");
	});

	QUnit.test("TG.copy() creates a meaningful callable TG.FunctionReference's", function(assert) {
		var o = { a: 1, b: 2, fn: {} };
		setType(o.fn, 'TG.FunctionReference');

		var n = {};
		TG.copy(o, n);

		assert.equal(n.a, 1, "property `a` was correctly reapplied");
		assert.equal(n.b, 2, "property `b` was correctly reapplied");
		assert.equal(typeof(n.fn), 'function', "`fn` exists and is callable");
	});

	QUnit.test("new TG.FunctionReference() creates a callable function", function(assert) {
		var fn = new TG.FunctionReference();
		assert.ok(isa(fn, 'TG.FunctionReference'), "the returned object is a TG.FunctionReference");
		assert.equal(typeof(fn), 'function', "the returned object is callable");
	});

	QUnit.test("TG.FunctionReference() methods call the appropriate server method", function(assert) {
		// throw "requirements not fully specified".toUpperCase();

		var fn = new TG.FunctionReference();
		fn.target = '123abc!@#$%^&*()_+-=[]{}\\|:;"\'<>,./?`~';
		fn.api = '/ajax/api';

		var o = {
			'fn': fn
		};
		var jsonp_bak = TG.API.jsonp;

		try {
			var jsonp_calls = [];
			TG.API.jsonp = function(api, method, args) {
				jsonp_calls.push({
					api: api, method: method, args: args
				});
			};

			o.fn(1, 'two');
			var c = jsonp_calls.pop();

			assert.ok(c, "TG.API.jsonp() was called");
			assert.equal(c.api, "/ajax/api", "the api was correct");
			assert.equal(c.method, fn.target, "the method name was correct");
			assert.ok(c.args, "args were provided");
			assert.ok(isa(c.args, Array), "args is an array");
			assert.equal(c.args[0], 1, "the first arguments is correct");
			assert.equal(c.args[1], "two", "the second argument is correct");
		} catch (ex) {
			throw ex;
		} finally {
			TG.API.jsonp = jsonp_bak;
		}

	});

	QUnit.test("jsonp() return-value objects with TG.FunctionReferences call the appropriate server method", function(assert) {
		var jsonp_rv = {"user":"","onchange":{"api":"\/ajax\/core.jsonp","target":"_target","isEvent":true,"__types":{"TG.FunctionReference":1}},"__types":{"Identity":1}};
		var o = {};
		TG.copy(jsonp_rv, o);

		var jsonp_bak = TG.API.jsonp;
		var poll_bak = TG.API.start;

		try {
			var jsonp_calls = [];
			var poll_calls = [];

			TG.API.jsonp = function(api, method, args) {
				jsonp_calls.push({
					api: api, method: method, args: args
				});
			};

			TG.API.start = function(api, method, args) {
				poll_calls.push({
					api: api, method: method, args: args
				});
			};

			o.onchange(1, 'two');

			var c = poll_calls.pop();

			assert.ok(c, "TG.API.start() was called");
			assert.equal(c.api, "/ajax/core.jsonp", "the api was correct");
			assert.equal(c.method, "_target", "the method name was correct");
			assert.ok(c.args, "args were provided");
			assert.ok(isa(c.args, Array), "args is an array");
			assert.equal(c.args[0], 1, "the first arguments is correct");
			assert.equal(c.args[1], "two", "the second argument is correct");
		} catch (ex) {
			throw ex;
		} finally {
			TG.API.jsonp = jsonp_bak;
			TG.API.start = poll_bak;
		}
	});


	//
	// callback mechanism(s)
	//

	QUnit.test("jsonp() returns an object with a returnTo method and eventually invokes multijsonp()", function(assert) {

		expect(6);
		var done = assert.async();

		var multijsonp_bak = TG.API.multijsonp;

		TG.API.multijsonp = function(api, calls) {
			assert.equal(api, 'some-api', "the requested api is `some-api`");
			assert.equal(calls.length, 1, "a single call was made");
			assert.equal(calls[0].f, 'some-method', "the requested server method is `some-method`");
			assert.equal(calls[0].p, 'p', "the parameters match the initially given parameters");
			assert.equal(calls[0].c, cb, "the relevant callback is present");
			TG.API.multijsonp = multijsonp_bak;
			done();
		};

		var cb = TG.API.jsonp('some-api', 'some-method', 'p');

		assert.equal(typeof(cb.returnTo), 'function', "cb.returnTo is a function");

	});

	QUnit.test("multijsonp() issues a well-formatted server request for single calls", function(assert) {

		mockAjax([1]);

		// TG.API['test-api'] = {t: ['123']};

		var actions = [{f:'test-method',p:['a parameter'],c:function(v){
			if (v != 1) { debug; }
		}}];
		TG.API.multijsonp('test-api', actions);

		var r = mockAjax.requests;
		assert.equal(r.length, 1, "a single request was issued");

		r = r[0];
		var c = r.log[0];
		assert.equal(c[0], 'open', "the first invocation was an open()");
		assert.equal(c[1], 'post', "the correct HTTP method was specified");
		assert.equal(c[2], 'test-api', "the correct path was specified");
		assert.equal(c[3], true, "async mode was specified");

		c = r.log[1];
		assert.equal(c[0], 'setRequestHeader', "the second invocation was to set a request header");
		assert.equal(c[1], 'Content-type', "Content-type was specified");
		assert.equal(c[2], "application/x-www-form-urlencoded", "content type was as expected");

		c = r.log[2];
		var requestBody = (c[1].match(/tg-a=(.*)$/))[1];
		assert.equal(c[0], 'send', "third invocation is the actual send()");
		assert.equal(requestBody, encodeURIComponent(TG.stringify(actions)), "request body was stringification of actions");

		unmockAjax();

	});

	QUnit.test("multijsonp() performs the expected callback for a single request", function(assert) {
		expect(3);
		var done = assert.async();

		// mockAjax(["TG.API.cb('1',0,{a:'value'});"]);
		mockAjax([{a:'value'}]);

		var cb = function(rv) {
			assert.ok(true, "the callback was called");
			assert.ok(rv, "a return value was given");
			assert.equal(rv.a, 'value', 'the value matches the mocked response');
			unmockAjax();
			done();
		};

		var actions = [{c: cb}];
		TG.API.multijsonp('test-api', actions);
		
	});

	QUnit.test("jsonp() provides a returnTo(rv) callback for a single request", function(assert) {
		expect(2);
		var done = assert.async();

		mockAjax(['return-value']);
		TG.API.jsonp('test-api', 'test-method', '').returnTo(function(rv) {
			assert.ok(true, "returnTo() was called");
			assert.equal(rv, 'return-value', "the correct return-value was given");
			unmockAjax();
			done();
		});

	});

	QUnit.test("jsonp() provides an `and` alias for `returnTo`", function(assert) {
		expect(2);
		var done = assert.async();

		mockAjax(['return-value 2']);
		TG.API.jsonp('test-api', 'test-method', '').and(function(rv) {
			assert.ok(true, "and() was called");
			assert.equal(rv, 'return-value 2', "the correct return-value was given");
			unmockAjax();
			done();
		});

	});

	//
	// TODO: Add some meaningful TG.API.Callback and/or jsonp() tests here ...
	// ... namely because the whole thing is probably due for refactoring,
	// and we don't want to break things.
	//

	QUnit.test("jsonp() calls can be chained", function(assert) {
		expect(3);
		var done = assert.async();

		var rva = {"B":{"api":"chain-api","target":"_B","isEvent":false,"__types":{"TG.FunctionReference":1}}};
		var rvb = {"C":{"api":"chain-api","target":"_C","isEvent":false,"__types":{"TG.FunctionReference":1}}};

		mockAjax([
			rva,
			rvb,
			'C-value',
		]);

		TG.API.jsonp('chain-api', 'A', '')
			.returnTo(function(rv) {
				assert.ok(rv && typeof(rv.B) == 'function', "A() returned an object with B()");
				return rv.B()
			})
			.returnTo(function(rv) {
				assert.ok(rv && typeof(rv.C) == 'function', "rv.B() returned an object with C()");
				return rv.C()
			})
			.returnTo(function(rv) {
				assert.equal(rv, 'C-value', "rv.C() returned `C-value`");
				unmockAjax();
				done();
			})
		;
	});

	QUnit.test("jsonp() calls can be chained using simple string-function names", function(assert) {
		expect(1);
		var done = assert.async();

		var rva = {"B":{"api":"string-chain-api","target":"_b","isEvent":false,"__types":{"TG.FunctionReference":1}}};
		var rvb = {"C":{"api":"string-chain-api","target":"_c","isEvent":false,"__types":{"TG.FunctionReference":1}}};

		mockAjax([
			rva,
			rvb,
			'C-value',
		]);

		TG.API.jsonp('string-chain-api', 'A', '')
			.returnTo('B')
			.returnTo('C')
			.returnTo(function(rv) {
				assert.equal(rv, 'C-value', "`C-value` was ultimately returned");
				unmockAjax();
				done();
			})
		;
	});

	QUnit.test("Callbacks can be finalized with immediate returns", function(assert) {
		var finalValue = null;
		var cb = new TG.API.Callback();
		cb.and(function(v) { return v + '.'; })
			.and(function(v) { finalValue = v; });
		cb('ok');
		assert.equal(finalValue, 'ok.', "the intermediate return value was caught");
	});

	// TODO: figure out why this breaks subsequent integration tests ...
	QUnit.test("start() subscribes to broadcasts", function(assert) {
		var done = assert.async();

		var returnValues = [
			'0',
			'1',
			'2',
			'stop',
			'disconnect-received'
		];
		mockAjax(returnValues);

		expect(returnValues.length - 2);

		var returns = 0;
		var poll = TG.API.start("endpoint", "method", '');
		poll.returnTo(function(rv) {
			console.log('broadcast rv', rv);
			if (rv == 'stop') {
				console.log('attempting to stop poll ...');
				poll.stop();
				unmockAjax();
				done();
			} else {
				assert.equal(returns, rv, "broadcast " + returns + " received");
				returns += 1;
			}
		});
	});

	QUnit.test("TG.Value resolves to its constructed value", function(assert) {
		var o = new TG.Value('some value');
		assert.equal('some value', o, "`o` became its constructed value during interpolation");
	});

	QUnit.test("TG.Value resolves to its set() value", function(assert) {
		var o = new TG.Value('some value');
		o.set('some other value');
		assert.equal('some other value', o, "`o` became its set() value");
	});

	QUnit.test("TG.Value signals value changes", function(assert) {
		var done = assert.async();
		var o = new TG.Value('a');

		on(o, 'change', function() {
			assert.ok(true, "the `change` event was fired");
			assert.equal('b', o, "`o` resolves to the new value");
			done();
		});

		o.set('b');
	});

})();
