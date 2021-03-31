<?php

	$meta_title = 'a thing that happened';

	// short circuits
	if (gets_set('id')) {
		$query = array('event_id' => $_GET['id']);
	} elseif (gets_set('u','t','c')) {
		$query = array(
			'e.user_id' => $_GET['u'],
			'e.thing_id' => $_GET['t'] ? $_GET['t'] : null,
			'e.challenge_id' => $_GET['c'] ? $_GET['c'] : null,
		);
	} else {
		redirect('/');
	}

	require_once('includes/game-inserts.inc');
	$rows = select_events($query);

	if (sizeof($rows) == 0) {
		print "Event not found.";
		return 1;
	}
	$event = $rows[0];

	$event_html = event_html($event, 'event-big');
	print $event_html;


?>
