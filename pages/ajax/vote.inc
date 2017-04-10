<?php

	$require_theme = 'jsonp';

	$json_reponse = '';

	if (isset($_GET['token']) && get_token($_GET['token']) == 'vote') {
		// dish out a new token
		$new_token = add_token('vote');
		$json_response = '"' . $new_token . '"';

		// get the current count
		$r = select_proverb($_GET['id']);
		$votes = (int)$r['likes'];

		// add or remove the vote
		if (isset($_GET['vote']) && $_GET['vote'] == '1') {
			if ($added = insert_proverb_vote($_GET['id'])) {
				$votes += $added;
				$json_response .= ", {$_GET['id']}, true, {$votes}";
			}
		} else {
			if ($deleted = delete_proverb_vote($_GET['id'])) {
				$votes -= $deleted;
				$json_response .= ", {$_GET['id']}, false, {$votes}";
			}
		}
	} else {
		$json_response = "";
	}

?>
