<?php

	$meta_title = 'lately around the dotcom';

	require_once('includes/game-inserts.inc');

	$criteria = array();
	if (isset($_GET['q']) && $_GET['q'] == '1') {
		$criteria['e.challenge_id>'] = 1;
	} else {
		$criteria[] = my_where(array(
			'e.challenge_id>' => 1,
			'e.page_title!=' => ''
		), 'or');
	}

	print "<div style='float: left; width: 100%; margin-top: 20px;'>";
	$news = select_recent_events($criteria, array('limit' => 10));
	$news = array_reverse($news);
	print events_html($news, '', 'events-medium', 'event-medium', 'event-medium');
	print "</div>";

?>
