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
