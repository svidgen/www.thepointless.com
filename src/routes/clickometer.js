/*
 * this is some of the oldest script on the site.
 * have mercy on my soul.
 */

var tval = 0;
var clicks = 0;

// game confirmation variables
var time = 5;

// get the level and breakability from the form
var level = 1;
var breakable = level === 1;

// bounds in clicks/second
var lower_bound = 1.5 * level;
var upper_bound = 10 * level;
var break_clickometer = 3;

var finish_event = false;
var event_finished = false;
var event_clock = false;

var last_click = 0;
var click_tracker = [1,2];
var timeout_tracker = [];

function pump(b) {
	click_tracker.push(b);

	if (b == 2) {
		if (click_tracker[click_tracker.length - 3] != 2) {
			return;
		}
	}

	if (!event_finished) {
		tval += 5;
		clicks += 1;
		if (tval > 99) {
			tval = 100;
			break_clickometer--;
		}

		updateMeter();

		if (breakable == 1 && break_clickometer <= 0) {
			breakClickometer();
		}
	}

	if ((!event_clock) &&(!event_finished)) {
		// finish_event = setTimeout('finishEvent();', 5000);
		event_clock = setTimeout(tick, 1);
		// tick();
		fallback();
		document.getElementById('timer').innerHTML = 'running';
	}
} // pump()


function tick() {
	if (time > 0 && !event_finished) {
		// document.getElementById('timer').innerHTML += ' ... ' + time;
		document.getElementById('timer').innerHTML = '';
		document.getElementById('timer').style.marginTop = '0.5em';
		document.getElementById('timer').innerHTML = time;
		time -= 1;
		event_clock = setTimeout(tick, 1000);
	} else {
		finishEvent();
	}
} // tick()


function fallback() {
	if (!event_finished) {

		tval -= 2.55;
		if (tval < 1) {
			tval = 0;
		}

		// bounds timeouts ... 
		// bound = 1000ms / clicks-per-second
		var variable_range = upper_bound - lower_bound;
		var pushback_percent = Math.max(tval, 1) / 100;
		var pushback_click_value = (pushback_percent * variable_range)
			+ lower_bound;
		var next_fall = 500 / pushback_click_value;
		var something = setTimeout(fallback, next_fall);
		updateMeter();
	}
} // fallback()


function updateMeter() {
	var green = Math.round( ((100 - tval) / 100) * 255.0);
	var red = 255 - green;
	var colorString = 'rgb(' + red + ',' + green+ ',0)';

	var meter_bar = document.getElementById('meter_bar');
	meter_bar.style.backgroundColor = colorString;
	meter_bar.style.width = tval + '%';

} // updateMeter()


function finishEvent() {
	if (!event_finished) {

		if (tval > 99) {
			tval = 100;
		}
		
		event_finished = true;
		document.getElementById('timer').innerHTML = 'STOP!';
		document.getElementById('meter_bar').style.width = tval + '%';

		// document.clickometer.s.value = tval.toFixed(2);
		console.log('result', tval.toFixed(2));
		document.getElementById('submit_button').disabled = '';
		
	}
} // finishEvent()


function breakClickometer() {
	finishEvent();
	tval = 100;
	updateMeter();
	document.getElementById('timer').innerHTML = "<span style='font-size: 18pt;'>boom.</span>";

	document.getElementById('submit_button').disabled = 'disabled';


	// change the background color of the container to yellow for 250ms
	var container_div = document.getElementById('clickocontainer');
	var oldColor = container_div.style.backgroundColor;
	container_div.style.backgroundColor = 'yellow';

	var meter = document.getElementById('meter');
	meter.style.borderWidth = '0px';
	meter.style.backgroundColor = 'yellow';
	
	document.getElementById('container').style.backgroundColor = 'yellow';
	document.body.style.background = 'yellow';

	// "deflate" the meter ... bar ... thing ... 
	var meter_bar = document.getElementById('meter_bar');
	var meter_width = 100;
	setInterval(
		function() {
			meter_width += 10;
			var opacity = Math.max(100 - (meter_width - 100) / 3, 0);
			
			meter_bar.style.width = Number(meter_width + (meter_width - 100.0) ) + "%";
			meter_bar.style.height = Number(meter_width * 3 + (meter_width * 3 - 100.0) ) + "%";
			meter_bar.style.top = (100.0 - meter_width * 3) + "%";
			meter_bar.style.left = (100.0 - meter_width) + "%";
			meter_bar.style.opacity = opacity / 100.0;
			meter_bar.style.filter = "alpha(opacity=" + Math.round(opacity) + ")";
		}
		, 10
	);
	
	setTimeout(function() { document.getElementById('clickometer_form').submit(); }, 2500);

} // breakClickometer()

global.clickometer_pump = pump;