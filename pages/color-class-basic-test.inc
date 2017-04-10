<?php
	$meta_title = 'Color Class Test';
?>
<div id='colortest'>Testing ... </div>
<script type='text/javascript' src='/js/color.js'></script>
<script type='text/javascript'>

	// break the tests out into timed batches to avoid the browser
	// freaking out about slow running scripts

	var r = 0;
	var g = 0;
	var b = 0;

	var errors = 0;
	var tests = 0;
	var largest_error = 0;
	var iterations_per_tick = 500;
	var inc = 1;
	var c;

	var colortest = document.getElementById('colortest');

	var __start = new Date();
	var test_interval = setInterval(function() {

		// perform iterations_per_tick tests
		for (var i = 0; i < iterations_per_tick; i++) {

			//
			// perform the actual test!
			//
			c = new Color(r, g, b);
			if (c.toHSLString().match(/NaN/i)) {
				errors += e;
				console.log(c);
			}			

			tests += 1;


			//
			// increment our RGB values
			// 
			r += inc;
			if (r > 255) {
				r = 0;
				g += inc;
			}

			if (g > 255) {
				g = 0;
				b += inc;
			}

			if (b > 255) {
				// testing is complete
				var __time = Math.round(((new Date()).getTime() - __start.getTime()) / 1000);
				colortest.style.color = "#202020";
				colortest.innerHTML = "tests: " + tests + ";<br />avg error: " + String(errors/tests) + ";<br />total errors: " + errors + "<br /> runtime: " + __time + " seconds";
				test_interval = clearInterval(test_interval);
				return;
			}


			//
			// quit early if we have too many errors
			//
			if (errors > 100) {
				colortest.innerHTML = "too many errors. see console.";
				test_interval = clearInterval(test_interval);
				return;
			}

		}

		var total_tests = (255 * 255 * 255) / inc;
		var pct_complete = tests / total_tests;
		var pct_complete_string = Math.round(pct_complete * 1000) / 10;
		var __time = Math.round(((new Date()).getTime() - __start.getTime()) / 1000);
		colortest.innerHTML = "Testing " + c.toRGBString() + "<br />" + pct_complete_string + "% complete<br />runtime: " + __time + " seconds";

	}, 10);


</script>
