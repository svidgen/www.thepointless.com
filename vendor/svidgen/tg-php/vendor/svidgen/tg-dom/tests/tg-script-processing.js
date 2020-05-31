(function() {

	var fixture = document.getElementById('qunit-fixture');

	QUnit.module('tg-script-processing');

	var appendScript = function(src) {
		var uniqueId = (new Date()).getTime() + '.' + Math.random();
		var tag = document.createElement('script');
		tag.src = src + "?" + uniqueId;
		document.body.appendChild(tag);
		return tag;
	};

	var testScript = function(assert, src, okText) {
		var done = assert.async();
		var script = appendScript(src);
		script.onload = function() {
			assert.equal(fixture.innerHTML, okText,
				"fixture value `"
				+ fixture.innerHTML
				+ "` matches the expected `" + okText
				+ "`"
			);
			done();
		}
	}; // testScript

	QUnit.test("basic scripts are returned and executed", function(assert) {
		testScript(assert, 'tests/simple.js', 'simple');
	});

	QUnit.test("require() finds local modules", function(assert) {
		testScript(assert, 'tests/local-require.js', 'local-module');
	});

	QUnit.test("require() finds a subdirectory module", function(assert) {
		testScript(assert, 'tests/subdir-require.js', 'sub-module');
	});

	QUnit.test("require() finds sub-sub modules", function(assert) {
		testScript(assert, 'tests/subsubdir-require.js', 'sub-sub-module');
	});

	QUnit.test("require() chains nested includes", function(assert) {
		testScript(assert, 'tests/nested-require.js', 'sub-sub-module');
	});

	QUnit.test("require() finds plain text files", function(assert) {
		testScript(assert, 'tests/subtext-require.js', "plain text.");
	});

	// QUnit.test("require() finds local modules in root", function(assert) {
		// testScript(assert, '/
	// });

})();
