<?php

$messaging_prefix = "simple_messaging";

if (!isset($messaging_poll_frequency)) {
	$messaging_poll_frequency = 10;
}

$messaging_poll_interval = round(1000000 / $messaging_poll_frequency);
$messaging_poll_interval += rand(-500, 500);



function receive_messages($channel, $last_received, $timeout) {
	global $messaging_prefix, $messaging_poll_interval;

	if (!$channel) {
		$channel = 'general';
	}

	if (!$last_received) {
		$last_received = 0;
	}

	if (!$timeout) {
		$timeout = 25;
	}

	$starttime = time();

	while ($starttime + $timeout > time()) {

		$mq = cache_fetch("{$messaging_prefix}.{$channel}");
		if ($mq && is_array($mq)) {
			$rv = array();
			foreach ($mq as $m) {
				if ((int)$m['id'] > $last_received) {
					$rv[] = $m;
				}
			}

			if (sizeof($rv) > 0) {
				return $rv;
			}
		}

		// wait 15ms before checking again
		usleep($messaging_poll_interval);

	}

	$rv = array();

} // receive_message()


function send_message($channel, $message) {
	global $messaging_prefix;

	if (!$channel) {
		$channel = 'general';
	}

	if (!$message) {
		$message = '';
	}

	$message_id_key = "{$messaging_prefix}.{$channel}.message_id";
	$message_q_key = "{$messaging_prefix}.{$channel}";

	// acquire next ID
	if (!cache_exists($message_id_key)) {
		cache_store($message_id_key, 1);
		$m_id = 1;
	} else {
		$m_id = cache_inc($message_id_key);
	}


	// acquire the queue
	$mq = cache_fetch($message_q_key);
	if (!$mq || !is_array($mq)) {
		$mq = array();
	}


	// purge old messages
	foreach ($mq as $k => $v) {
		if ($v['id'] < $m_id - 128) {
			unset($mq[$k]);
		}
	}


	// add the new message
	$mq[] = array(
		'id' => $m_id,
		'message' => $message
	);


	// store the new array in the cache
	cache_store($message_q_key, $mq, 30);


	// return true if no failures have occurred
	// on that note, we need to add some failure/result checking!
	return true;

} // send_message()


?>
