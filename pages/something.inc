<div id='older_somethings' style='display: none;'><a href='javascript:olderSomethings();'>Older</a></div>
<div id='prepend_after'></div>
<?php

	$meta_title = "something";

	$default_page_size = 10;

	require_once('includes/dbconnect.inc');
	require_once('includes/game-inserts.inc');

	if (isset($_GET['message'])) {
		if (isset($_GET['token']) && get_token($_GET['token']) == 'post_something') {
			// before inserting, check the message for matches against our
			// award-yielding messages ...
			$m = strtolower(normalize($_GET['message']));

			$pi = "3\\.141(5(9(2(6(5(3(58?)?)?)?)?)?)?)?";

			if (preg_match("/^{$pi}/", $m)) {
				award_and_notify("Half-eaten PI", 1, 1, '/something');
			} elseif (preg_match("/^apple {$pi}/i", $m)) {
				award_and_notify("Apple PI", 1, 1, '/something');
			} elseif (preg_match("/^caramel apple {$pi}/i", $m)) {
				award_and_notify("Caramel Apple PI", 1, 1, '/something');
			} elseif ($m == "i wonder where my fish did go") {
				award_and_notify("Fishy Fish", 1, 1, '/something');
			}

			$id = my_insert(
				'somethings',
				array(
					'message' => $_GET['message'],
					'ip' => $_SERVER['REMOTE_ADDR']
				)
			);
		}
	}

	$rows = select_somethings(
		array(
			'id' => isset($_GET['id']) ? (int)$_GET['id'] : 0,
			'pagesize' => isset($_GET['pagesize']) ? (int)$_GET['pagesize'] : $default_page_size * -1,
		)
	);

	$token = add_token('post_something');

	$low_id = false;
	$high_id = false;
	$messages = array();
	foreach ($rows as $row) {
		if ($row['message']) {
			$message = htmlsafe($row['message']);
			$messages[] = $message;
			print "<div class='something_line'>{$message}</div>";
		}

		// rows will be sorted by something_id asc -- so the first
		// one in the set is always the lowest ... 
		if (!$low_id || $low_id > $row['something_id']) {
			$low_id = $row['something_id'];
		}

		if (!$high_id || $high_id < $row['something_id']) {
			$high_id = $row['something_id'];
		}

	}

	if ($result = my_query('select min(something_id) absolute_lowest_id from somethings', $db)) {
		$row = my_fetch_assoc($result);
		$absolute_lowest_id = $row['absolute_lowest_id'];
	} else {
		$absolute_lowest_id = $low_id;
	}


	/*
	// DEBUG
	print "<pre> " . print_r($row, 1) . "</pre>";
	print "<pre> " . print_r($lowest_id, 1) . "</pre>";
	print "<pre> " . print_r($more_somethings, 1) . "</pre>";
	*/

	$async_response = array(
		's' => $messages,
		'l' => $low_id,
		'h' => $high_id,
		'al' => $absolute_lowest_id,
		't' => $token
	);

	$json_response = json_encode($async_response);

?>
<div id='append_before'></div>

<style type='text/css'>
	.faded {
		background-color: #f0fff0;
	}
</style>

<form name='something' action='/something' method='get' onsubmit="void(postSomething()); this.message.value=''; return false;">
	<div style='margin: 20px; text-align: right;'>
		<input type='hidden' name='token' id='token_field' value='<?php print $token; ?>' />
		<input type='text' id='message_field' name='message' maxlength='200' placeholder='OOoOoo fishy fishy fishy FISH!' style='width: 350px; font-size: large;' />
		<input type='submit' value='Mmmk.' style='font-size: large;' />
	</div>
</form>

<script type='text/javascript'>

	var low_id = <?php print (int)$low_id; ?>;
	var high_id = <?php print (int)$high_id; ?>;
	var pagesize = <?php print isset($_GET['pagesize']) ? (int)$_GET['pagesize'] : $default_page_size; ?>;
	var token_field = document.getElementById('token_field');
	var message_field = document.getElementById('message_field');
	var fadeq = [];

	function prependSomethings(r) {
		for (var i = r.s.length - 1; i >= 0; i--) {
			var newdiv = document.createElement('div');
			newdiv.className = 'something_line';
			newdiv.style.backgroundColor = '#ffffdd';
			newdiv.innerHTML = r.s[i];
			insertAfter(newdiv, document.getElementById('prepend_after'));
			fadeq.push({"node":newdiv,"step":20,"target":'ffffff'});
		}

		if (r.l) {
			low_id = r.l;
			if (r.al >= r.l) {
				document.getElementById('older_somethings').style.display = 'none';
			}
		}

		token_field.value = r.t;
	} // prependSomethings()


	function appendSomethings(r) {
		if (r.h && r.h > high_id) {
			for (var i = 0; i < r.s.length; i++ ) {
				var newdiv = document.createElement('div');
				newdiv.className = 'something_line';
				newdiv.style.backgroundColor = '#ffffdd';
				newdiv.innerHTML = r.s[i];
				var ab = document.getElementById('append_before');
				ab.parentNode.insertBefore(newdiv, ab);
				fadeq.push({"node":newdiv,"step":20,"target":'ffffff'});
			}
			high_id = r.h;
		}

		token_field.value = r.t;
	} // appendSomethings()


	function fade() {
		var c;
		var ca;
		var t;
		var ta;
		var d;
		var r;
		var newq = [];
		for (var i = 0; i < fadeq.length; i++) {
			var item = fadeq.shift();
			if (!item || !item.node) { continue; }
			c = item.node.style.backgroundColor.replace('#', '');
			if (r = c.match(/([0-9]+), ?([0-9]+), ?([0-9]+)/)) {
				ca = [
					parseInt(r[1]),
					parseInt(r[2]),
					parseInt(r[3])
				];
			} else {
				ca = [
					parseInt(c.substr(0,2), 16),
					parseInt(c.substr(2,2), 16),
					parseInt(c.substr(4,2), 16)
				];
			}

			t = item.target;
			ta = [
				parseInt(t.substr(0,2), 16),
				parseInt(t.substr(2,2), 16),
				parseInt(t.substr(4,2), 16)
			];


			if (typeof(item.step) != 'object') {
				var step = item.step;
				item.step = [
					Math.ceil((ta[0] - ca[0]) / step),
					Math.ceil((ta[1] - ca[1]) / step),
					Math.ceil((ta[2] - ca[2]) / step)
				];
			}

			// alert(item.step.join(';'));
			// debugprint(ca[0] + ca[1] + ca[2] + "\n");

			for (var y = 0; y < 3; y++) {
				ca[y] = Math.min(parseInt('ff', 16), ca[y] + item.step[y]);
				ca[y] = ca[y].toString(16);
			}

			item.node.style.backgroundColor = '#' + ca.join('');

			if (ca.join('') != item.target) {
				fadeq.push(item);
			}
		}
	} // fade()


	function debugprint(s) {
		var n = document.getElementById('debug-print');
		if (!n) {
			n = document.createElement('div');
			n.id = 'debug-print';
			document.body.appendChild(n);
		}
		n.innerHTML += s.replace("\n", "<br />");
	} // debugprint()


	function olderSomethings() {
		TPDC.jsonpRaw('/something.jsonp?cb=prependSomethings&id=' + low_id + '&pagesize=' + (pagesize * -1));
	} // olderSomethings()


	function newerSomethings() {
		TPDC.jsonpRaw('/something.jsonp?cb=appendSomethings&id=' + high_id + '&pagesize=1000');
	}


	function postSomething() {
		TPDC.jsonpRaw('/something.jsonp?cb=appendSomethings&id=' + high_id + '&pagesize=1000&message=' + encodeURIComponent(message_field.value) + '&token=' + token_field.value);
		return false;
	} // postSomething()


	<?php
		if ($low_id > $absolute_lowest_id) {
			print "document.getElementById('older_somethings').style.display = 'block';";
		}
	?>

	var nsp = setInterval(function() { newerSomethings(); }, 5000);
	var foi = setInterval(function() { fade(); }, 200);

</script>

