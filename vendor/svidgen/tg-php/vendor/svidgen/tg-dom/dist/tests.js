(function() {

	if (this.tgmodule && this.require) {
		return;
	}

	var stack = [];
	var pathstack = ['.'];

	tgmodule = {
		'start': function(name) {
			stack.push(name);
		},
		'end': function(name) {
			if (stack[stack.length - 1] === name) {
				stack.pop();
			}
		},
		'setpath': function(path) {
			pathstack.push(path === './' ? '.' : path);
		},
		'unsetpath': function() {
			pathstack.pop();
		},
		'list': function() {
			var rv = [];
			for (var k in require.cache) {
				rv.push(k);
			}
			return rv;
		},
		'd': function(p,n,f) {
			var module = {};
			this.setpath(p);
			this.start(n);
			var src = stack[stack.length - 1];
			typeof(f) === 'function' ? f(module) : module.exports = f;
			require.cache[src] = module;
			this.end(n);
			this.unsetpath();
		}
	};

	require = function(src) {
		var m = require.cache[require.resolve(src)];
		if (!m) { throw "`" + src + "` does not exist."; }
		return m.exports;
	};

	require.cache = {};

	require.resolve = function(src) {
		var path = src.split(/\//);
		var wcpath = pathstack[pathstack.length - 1].split(/\//);
		while (path[0] == '..') {
			path.shift();
			wcpath.pop();
		}
		while (path[0] == '.') {
			path.shift();
		}
		return wcpath.join('/') + '/' + path.join('/');
	}; // resolve()

})();


tgmodule.d('./','./tg-upon.js',function(module){

});


tgmodule.d('./','./tg-dom.js',function(module){
(function() {

	var fixture = document.getElementById('qunit-fixture');

	QUnit.module("tg-dom");

	QUnit.test("isa() identifies core JS types", function(assert) {
		var und;
		var nul = null;
		var num = 123;
		var str = "string";
		var arr = [];
		var obj = {};
		var fun = function() {};

		assert.ok(isa(und, undefined), "undefined was correctly identified");
		assert.ok(isa(nul, null), "null was correctly identified");
		assert.ok(isa(num, Number), "Number was correctly identified");
		assert.ok(isa(str, String), "String was correctly identified");
		assert.ok(isa(arr, Array), "Array was correctly identified");
		assert.ok(isa(obj, Object), "Object was correctly identified");
		assert.ok(isa(fun, Function), "Function was correctly identified");
	});

	QUnit.test("isa() identifies Nodes", function(assert) {
		var n = document.createElement('div');
		assert.ok(isa(n, Node), "div was identified as a Node instance");
	});

	QUnit.test("isa() identifies constructors", function(assert) {
		var f1 = function() {};
		var f2 = function() {};
		var o1 = new f1();
		var o2 = new f2();
		assert.ok(isa(o1, f1) && isa(o2, f2), "instances are correctly identified against their own constructors");
		assert.ok(!isa(o1, f2) && !isa(o2, f1), "instances are not falsely identified against other constructors");
	});

	QUnit.test("setType() & isa() mark and recognize named types", function(assert) {
		var o = {};
		assert.ok(!isa(o, 'something'), "object without named type 'something' is correclty identified has not having the explicit type");
		setType(o, "something");
		assert.ok(isa(o, 'something'), "object with named type 'something' is correctly identified");
	});

	QUnit.test("setType() and isa() mark and recognize unnamed functions", function(assert) {
		var o = {};
		var fn = function(a,b) { console.log(a, b); };
		assert.ok(!isa(o, fn), "object without type is identified as not having the type");

		setType(o, fn);
		assert.ok(isa(o, fn), "object WITH type is identified as HAVING the type");
	});



	//
	// TG pseudo-event monitoring functions
	//

	QUnit.test("on() : subscribers are called exactly once per fire()", function (assert) {
		var o = {};
		var s1 = 0;
		var s2 = 0;

		on(o, 'action', function () { s1++; });
		on(o, 'action', function () { s2++; });
		on(o, 'action').fire()

		assert.ok(s1 >= 1, "first subscriber notified at least once");
		assert.ok(s1 <= 1, "first subscriber noticed only once");
		assert.ok(s2 >= 1, "second subscriber notified at least once");
		assert.ok(s2 <= 1, "second subscriber noticed only once");

		on(o, 'action').fire();
		assert.ok(s1 >= 2, "first subscriber was notified at least once on a subsequent fire()");
		assert.ok(s1 <= 2, "first subscriber was notified only once on a subsequent fire()");
		assert.ok(s2 >= 2, "second subscriber was notified at least once on a subsequent fire()");
		assert.ok(s2 <= 2, "second subscriber was notified only once on a subsequent fire()");

	});

	QUnit.test("on() : single-fire events subscribers are called exactly once", function (assert) {
		var o = {};
		var s1 = 0;
		var s2 = 0;

		on(o, 'action', function () { s1++; }, true);
		on(o, 'action', function () { s2++; }, true);
		on(o, 'action').fire()

		assert.equal(s1, 1, "first subscriber notified exactly once");
		assert.equal(s2, 1, "second subscriber notified exactly once");

		on(o, 'action').fire();
		assert.equal(s1, 1, "first subscriber was [correctly] not re-notified on a subsequent fire()");
		assert.equal(s2, 1, "second subscriber was [correctly] not re-notified on a subsequent fire()");

	});

	QUnit.test("on() with immediate callback passes parameters", function(assert) {
		var o = {};
		var a = null;
		var b = null;
		var c = null;

		on(o, 'action', function(_a, _b, _c) { a = _a; b = _b; c = _c; });
		on(o, 'action').fire(1,2,3);

		assert.ok(a === 1 && b === 2 && c === 3, "all parameters were received by the subscriber");
	});

	QUnit.asyncTest("on() with delayed callback passes parameters", function(assert) {
		var o = {};
		var a = null;
		var b = null;
		var c = null;

		on(o, 'action', function(_a, _b, _c) { a = _a; b = _b; c = _c; });

		setTimeout(function() {
			on(o, 'action').fire(1,2,3);
			assert.ok(a === 1 && b === 2 && c === 3, "all parameters were received by the subscriber");
			QUnit.start();
		}, 50);
	});

	QUnit.test("on().intercept(interceptor) stops an event", function (assert) {
		var o = {};
		var subscriberCalled = 0;
		var interceptorCalled = 0;

		on(o, 'action', function () { subscriberCalled++; });
		on(o, 'action').intercept(function (evt) { interceptorCalled++; });
		on(o, 'action').fire();

		assert.equal(interceptorCalled, 1, "the interceptor was called");
		assert.equal(subscriberCalled, 0, "the subscriber was not called");
	});

	QUnit.test("on().intercept(interceptor) passes a resume()able event [proxy] to the interceptor", function (assert) {
		var o = {};
		var subscriberCalled = 0;
		var interceptorCalled = 0;

		on(o, 'action', function () { subscriberCalled = subscriberCalled * 2; });
		on(o, 'action').intercept(function (evt) { interceptorCalled = 1; subscriberCalled = 1; evt.resume(); });
		on(o, 'action').fire();

		assert.equal(interceptorCalled, 1, "the interceptor was called");
		assert.equal(subscriberCalled, 2, "the subscriber called, and the interceptor was called first");
	});

	QUnit.test("on().intercept(interceptor) succeeds with multiple true-returning intercetpors", function (assert) {
		var o = {};
		var subscriberCalled = 0;
		var interceptorCalled = 0;

		on(o, 'action', function () { subscriberCalled = subscriberCalled * 2; });
		on(o, 'action').intercept(function (evt) { interceptorCalled++; subscriberCalled++; evt.resume(); });
		on(o, 'action').intercept(function (evt) { interceptorCalled++; subscriberCalled++; evt.resume(); });
		on(o, 'action').fire();

		assert.equal(interceptorCalled, 2, "both interceptors were called");
		assert.equal(subscriberCalled, 4, "the subscriber called, and both interceptors were called first");
	});

	QUnit.test("on().intercept(interceptor) stops entirely on the first non-resuming interceptor", function (assert) {
		var o = {};
		var subscriberCalled = 0;
		var interceptorCalled = 0;

		on(o, 'action', function () { subscriberCalled++; });
		on(o, 'action').intercept(function (evt) { interceptorCalled++; });
		on(o, 'action').intercept(function (evt) { interceptorCalled++; evt.resume(); });
		on(o, 'action').fire();

		assert.equal(interceptorCalled, 1, "only one interceptor was called");
		assert.equal(subscriberCalled, 0, "the subscriber was not called");
	});

	QUnit.test("onready() operates like a single-fire event", function (assert) {
		var o = {};
		var s1 = 0;
		var s2 = 0;

		onready(o, function () { s1++; });
		onready(o, function () { s2++; });
		onready(o).fire();

		assert.ok(s1 == 1, "first subscriber notified exactly once");
		assert.ok(s2 == 1, "second subscriber notified exactly once");

		onready(o).fire();
		assert.ok(s1 == 1, "first subscriber was [correctly] not re-notified on a subsequent fire()");
		assert.ok(s2 == 1, "second subscriber was [correctly] not re-notified on a subsequent fire()");

	});

	QUnit.test("upon() performs callback immediately when possible", function (assert) {
		var r = false;
		upon(function () { return true; }, function () { r = true; });
		assert.ok(r, "immediately performed callback for a test that always returns true");
	});

	QUnit.test("upon() doesn't prematurely perform callback on delayed test-conditions", function (assert) {
		var t = false;
		var r = false;
		setTimeout(function () { t = true; }, 1000);
		upon(function () { return t; }, function () { r = true; });
		assert.ok(r === false, "didn't prematurely perform callback");
	});

	QUnit.asyncTest("upon() performs callback 'soon' after a delayed test-condition is true", function (assert) {
		expect(2);

		var startTime = (new Date()).getTime();
		var endTime = 0;
		setTimeout(function () { endTime = (new Date()).getTime(); }, 200);

		upon(function () { return endTime > startTime; }, function () {
			var fireTime = (new Date()).getTime();
			assert.ok(true, "callback was called");
			assert.ok(fireTime - endTime < 100, "less than 100 ms passed between state change and callback");
			QUnit.start();
		});
	});

	QUnit.test("Bind(c, .className) uses templateMarkup to build New(c) with the proper className applied", function(assert) {
		var C = function() {};
		C.templateMarkup = "Wee!";
		Bind(C, '.c');
		var n = New(C);
		assert.ok(n.innerHTML == 'Wee!', "innerHTML matched the templateMarkup");
		assert.ok(n.className == 'c', "className is 'c'");
	});

	QUnit.test("Bind() pre-attaches nodes as properties of `this` in constructors", function(assert) {
		var C = function() {
			var nameNode = this.name;

			this.getPreNameNode = function() {
				return nameNode;
			}; // getPreNameNode()
		};
		C.templateMarkup = "Welcome <span data-id='name'>Person</span>!";
		Bind(C, 'c');
		var n = New(C);

		assert.ok(isa(n.name, Node), "n.name is a Node");
		assert.ok(isa(n.getPreNameNode(), Node), "n.getPreNameNode is a node");
		assert.ok(n.name === n.getPreNameNode(), "n.name and n.getPreNameNode are the same");
		assert.ok(n.name.innerHTML == "Person", "n.name.innerHTML is 'Person'");
	});

	QUnit.test("Direct assignment to Bind()ed node properties updates the DOM", function(assert) {
		var C = function() {};
		C.templateMarkup = "Hello <span data-id='world'>World</span>!";
		Bind(C, '.c');
		var n = New(C);

		var galaxy = document.createElement('span');
		galaxy.innerHTML = "Galaxy";
		n.world = galaxy;

		assert.ok(n.innerHTML == "Hello <span>Galaxy</span>!", "the nodes innerHTML now contains the new markup in place of the old");

		var spans = getNodes(n, 'span');
		assert.strictEqual(spans[0], galaxy, "the inserted node IS the created and assigned node");
	});

	QUnit.test("Bind() attaches identified nodes under target node `this`", function(assert) {
		var found_person;
		var found = false;

		var C = function() {
			found = true;
			found_person = this.person;
		};

		fixture.innerHTML = "<div class='class-c'>Hello <span data-id='person'>Person</span>.</div>";
		Bind(C, '.class-c');

		assert.ok(found, "the target node was bound");
		assert.notStrictEqual(typeof(found_person), 'undefined', "the person attribute was found");
		assert.strictEqual(found_person.innerHTML, 'Person', "the person attribute contained the correct markup");

		var CNodes = getNodes(fixture, C);
		var cnode = CNodes[0];

		var cat = document.createElement('span');
		cat.innerHTML = 'Cat';
		cnode.person = cat;
		assert.ok(fixture.innerHTML.match(/Cat/), "after assigning `cat` to `person`, the DOM is updated");
	});

	QUnit.test("Bind() substitutes nodes from the target in place of the identified templateMarkup nodes", function(assert) {

		var C = function() {}; 
		C.templateMarkup = "Hi there <span data-id='world'>World</span>!";
		fixture.innerHTML = "<div class='werld-c'><span data-id='world'>Werrrld</span></div>";
		Bind(C, '.werld-c');

		assert.ok(fixture.innerHTML.match(/>Hi there/), "the updated markup has Hello in it");
		assert.ok(fixture.innerHTML.match(/>Werrrld</), "the updated markup has the new Werrrld node in it");

	});

	QUnit.test("Bind() inserts tag attribute text into the target node's innerHTML and value fields.", function(assert) {
		
		var C = function() {}; 
		C.templateMarkup = "Hello <span data-id='world'>World</span>!";
		fixture.innerHTML = "<div class='c' world='Guy'></div>";
		Bind(C, '.c');

		assert.ok(fixture.firstChild.innerHTML.match(/Guy/), "the updated markup has attr-arg ('Guy') injected into the doc");
	});

	QUnit.test("Bind() targets an ID'd nodes innerHTML when data-property='innerHTML' is set", function(assert) {

		var C = function() {};
		C.templateMarkup = "Hello <span data-id='world' data-property='innerHTML'>World</span>!";
		Bind(C, 'c');

		var c = New(C);
		
		assert.ok(c.world === 'World', "the associated property returns the inner markup");

		c.world = "Not World";
		assert.strictEqual(c.world, 'Not World', "assigning to the property changes the return value");
		assert.ok(c.innerHTML.match(/>Not World</), "the containing node's markup reflected the desired markup change.");

	});

	QUnit.test("Bind() accessors are serializeable with TG.stringify()", function(assert) {
		var C = function() {};
		C.templateMarkup = "Hello <span data-id='world' data-property='innerHTML'>World</span>!";
		Bind(C, 'c');
		var c = New(C);
		var serialization = TG.stringify(c);
		eval("var c2 = " + serialization);
		assert.equal(c2.world, "World", "the rebuilt-from-json object contains .world='World'");
	});

	QUnit.test("Bind() resolves TG.Value object values", function(assert) {
		var o = new TG.Value('hello');
		var C = function() {};
		C.templateMarkup = "<span data-id='world'>bahh</span>";
		Bind(C, 'c');
		var c = New(C);
		c.world = o;
		assert.equal(c.world, 'hello', "`world` property is the TG.Value value");
	});

	QUnit.test("Bind() updates nodes as TG.Value values change", function(assert) {
		var o = new TG.Value('ahhh');
		var C = function() {};
		C.templateMarkup = "<span data-id='world'>bahh</span>";
		Bind(C, 'c');
		var c = New(C);
		c.world = o;
		o.set('hello');
		assert.equal(c.world, 'hello', "`world` property was updated when TG.Value was set()");
	});

	QUnit.test("TG.Value's can be bound to multiple nodes", function(assert) {
		var o = new TG.Value('ahhh');

		var C = function() {};
		C.templateMarkup = "<span data-id='world'>bahh</span>";
		Bind(C, 'c');

		var c1 = New(C);
		c1.world = o;

		var c2 = New(C);
		c2.world = o;

		o.set('hello');
		assert.equal(c1.world, 'hello', "`world` property was updated on `c1` when TG.Value was set()");
		assert.equal(c2.world, 'hello', "`world` property was updated on `c2` when TG.Value was set()");
	});

	QUnit.test("Bind() also initializes child constructors", function(assert) {
		var P = function() {};
		P.templateMarkup =
			"<div data-id='pvalue' data-property='innerHTML'>p hello</div>"
			+ "<div data-id='cnode' class='c'></div>"
		;
		Bind(P, '.p');

		var C = function() {};
		C.templateMarkup =
			"<div data-id='cvalue' data-property='innerHTML'>c hello</div>"
		;
		Bind(C, '.c');
		
		var n = New(P);

		assert.equal(n.pvalue, 'p hello', 'parent value property is set');
		assert.equal(n.cnode.cvalue, 'c hello', 'child value property is set');
	});

	// TODO: rename this ... 
	QUnit.test("Bind()'d nodes created with New() identify properly", function(assert) {
		var P = function() {};
		P.templateMarkup =
			"<div data-id='pvalue' data-property='innerHTML'>hello</div>"
			+ "<div data-id='cnode' class='c'></div>"
		;
		Bind(P, '.p');

		var C = function() {};
		C.templateMarkup =
			"<div data-id='cvalue' data-property='innerHTML'>hello</div>"
		;
		Bind(C, '.c');
		
		var n = New(P);

		assert.ok(isa(n, P), "the root node identifies as P");
		assert.ok(isa(n.cnode, C), "the child node identifies as C");
	});

	QUnit.test("Bind() applies nested initializer properties to nested nodes", function(assert) {
		var P = function() {};
		P.templateMarkup =
			"<div data-id='pvalue' data-property='innerHTML'>hello</div>"
			+ "<div data-id='cnode' class='c'></div>"
		;
		Bind(P, '.p');

		var C = function() {};
		C.templateMarkup =
			"<div data-id='cvalue' data-property='innerHTML'>hello</div>"
		;
		Bind(C, '.c');
		
		var n = New(P, { pvalue: 'parent', cnode: { cvalue: 'child' }});

		assert.equal(n.pvalue, 'parent', 'parent value property is set');
		assert.equal(n.cnode.cvalue, 'child', 'child value property is set');
	});

	QUnit.test("Bind() attaches nested constructed nodes on existing markup", function(assert) {
		var Outer = DomClass("<t:outer>outer html<div data-id='inner'></div></t:outer>");
		var Inner = DomClass("<t:inner>inner html</t:inner>");
		fixture.innerHTML = "<t:outer><t:inner data-id='inner'></t:inner></t:outer>";
		Bind(fixture);

		assert.ok(fixture.innerHTML.match(/outer html/), "t:outer was bound");
		assert.ok(fixture.innerHTML.match(/inner html/), "t:inner was bound");
	});

	QUnit.test("DomClass gracefully ignores non-ID'd params", function(assert) {
		var Widget = DomClass("<t:widget><b data-id='x'>default</b></t:widget>");

		// note the widget has spaces / text nodes in it
		fixture.innerHTML = "<t:widget> <b data-id='x'>value</b> </t:widget>";
		Bind(fixture);

		assert.ok(true, "things didn't blow up!");
	});

	// QUnit.test("Bind() supports 3 layers of DomClass nesting", function(assert) {
	// 	DomClass("<t:nest-one>one html<div data-id='inner'></div></t:nest-one>");
	// 	DomClass("<t:nest-two>two html</t:nest-two>");
	// 	DomClass("<t:nest-three>three html></t:nest-three>");
	// 	fixture.innerHTML = "<t:outer><t:inner data-id='inner'></t:inner></t:outer>";
	// 	Bind(fixture);

	// 	assert.ok(fixture.innerHTML.match(/outer html/), "t:outer was bound");
	// 	assert.ok(fixture.innerHTML.match(/inner html/), "t:inner was bound");
	// });

	QUnit.test("A basic `DomClass` can be newed up.", function(assert) {
		var C = DomClass("<t:newable>inner html</t:newable>");
		fixture.appendChild(new C());
		assert.ok(fixture.innerHTML.match(/inner html/), "inner markup was preserved");
	});

	QUnit.test("A `DomClass` can be newed up, preserving inner tags.", function(assert) {
		var C = DomClass("<t:newable>inner <b>BOLD</b></t:newable>");
		fixture.appendChild(new C());
		assert.ok(fixture.innerHTML.match(/inner <b>BOLD<\/b>/), "inner markup was preserved");
	});

	QUnit.test("A `DomClass` can be newed up, preserving inner identified tags.", function(assert) {
		var C = DomClass("<t:newable>inner <span data-id='bolded'>identified</span></t:newable>");
		fixture.appendChild(new C());
		assert.ok(fixture.innerHTML.match(/inner/), "inner markup was preserved");
		assert.ok(fixture.innerHTML.match(/identified/), "inner markup was preserved");
		assert.equal(fixture.firstChild.bolded.innerHTML, 'identified');
	});

	QUnit.test("A `DomClass` with a nested `DomClass` can be newed up.", function(assert) {
		DomClass("<t:innernewable>very inner html</t:innernewable>");
		var C = DomClass("<t:outernewable>outer <t:innernewable></t:innernewable></t:outernewable>");
		fixture.appendChild(new C());
		assert.ok(fixture.innerHTML.match(/outer/), "inner markup was preserved");
		assert.ok(fixture.innerHTML.match(/very inner html/), "inner markup was preserved");
	});

})();
});


tgmodule.d('./','./tg-api.js',function(module){
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
});


tgmodule.d('./','./tg-dragdrop.js',function(module){

});


tgmodule.d('./','./tg-test.js',function(module){

});


tgmodule.d('./','./tg-ui.js',function(module){

});


tgmodule.d('./','./tg-observe.js',function(module){
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
});

tgmodule.setpath('.');
require('tg-upon.js');
require('tg-dom.js');
require('tg-api.js');
require('tg-dragdrop.js');
require('tg-test.js');
require('tg-ui.js');
require('tg-observe.js');
