<?php
	$meta_title = 'Color Class Test';
?>
<div id='colortest'>Testing ... </div>
<script type='text/javascript' src='/js/color.js'></script>
<script type='text/javascript'>

	// break the tests out into timed batches to avoid the browser
	// freaking out about slow running scripts

	var h = 0;
	var s = 0;
	var l = 0;

	var errors = 0;
	var tests = 0;
	var largest_error = 0;
	var iterations_per_tick = 500;
	var inc = 1;

	var colortest = document.getElementById('colortest');

	var test_interval = setInterval(function() {

		// perform iterations_per_tick tests
		for (var i = 0; i < iterations_per_tick; i++) {

			//
			// perform the actual test!
			//
			var hsl = "hsl(" + h + "," + s + "%," + l + "%)";
			var c = new Color(hsl);
			
			colortest.style.color = hsl;
			var cc = new Color(colortest.style.color);

			var e = 0;

			if (cc.r != c.r) {
				e += Math.abs(cc.r - c.r);
			}

			if (cc.g != c.g) {
				e += Math.abs(cc.g - c.g);
			}

			if (cc.b != c.b) {
				e += Math.abs(cc.b - c.b);
			}

			if (e > largest_error) {
				largest_error = e;
			}

			errors += e;
			tests += 1;


			//
			// increment our HSL values
			// 
			h += inc;
			if (h >= 360) {
				h = 0;
				s += inc;
			}

			if (s > 100) {
				s = 0;
				l += inc;
			}

			if (l > 100) {
				// testing is complete
				colortest.style.color = "#202020";
				colortest.innerHTML = "tests: " + tests + ";<br />avg error: " + String(errors/tests) + ";<br />largest error: " + largest_error;
				test_interval = clearInterval(test_interval);
				return;
			}

		}

		var total_tests = (360 * 100 * 100) / inc;
		var pct_complete = tests / total_tests;
		var pct_complete_string = Math.round(pct_complete * 1000) / 10;
		colortest.innerHTML = "Testing ... " + pct_complete_string + "%";

	}, 10);


	//
	// Chrome:
	//
	// tests: 3672360;
	// avg error: 0.8495912710082889;
	// largest error: 3

</script>
