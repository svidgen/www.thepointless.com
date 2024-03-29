<?php

header('Content-type: text/javascript');

$cb = isset($_GET['cb']) ? $_GET['cb'] : 'jsonp_cb';

if (isset($args['json_response'])) {
	$json_response = $args['json_response'];
} else {
	if (isset($args['__content_rv'])) {
		$json_response = json_encode($args['__content_rv']);
	} else {
		$json_response = 'null';
	}
}

print "{$cb}({$json_response});";


// if there are any pending notifications, send those along for the ride.
require_once('includes/game-inserts.inc');
print tpdc_notifications_js();


if (isset($json_debug)) {
	print "

/**** DEBUG INFO ****

{$json_debug}

***** DEBUG INFO ****/";
}

?>
