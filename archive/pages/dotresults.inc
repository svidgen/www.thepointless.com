<?php

	// NOTE: {subject} is replaced in the resultcard client-side.

	require_once('includes/sitemap.inc');
	require_once('includes/game-inserts.inc');

	if (isset($_POST['clicks'])) {
		$clicks = (int)$_POST['clicks'];
	} else {
		$clicks = 0;
	}

	if ($clicks == 1) {
		$click_text = 'time';
		$click_click_text = 'click';
	} else {
		$click_text = 'times';
		$click_click_text = 'clicks';
	}

	if (isset($_POST['dot'])) {
		$dot = $_POST['dot'];
	} else {
		$dot = '';
	}
	
	$meta_title = "for the love of the dot!";

	print resultcard_html(
		// "result"
		"{subject} clicked the {$dot} dot <i>{$clicks}</i> {$click_text}.",

		// image
		null,

		// title
		"Congratulations!?",

		// description
		($clicks > 0 ?
			"And {subject}'ve verified that it <i>really</i> doesn't do anything."
			: "Which means {subject}'ve escaped it's heavenly appeal, I suppose.")
		. " So ... hooray.",

		$_SERVER['HTTP_REFERER']
	);

?>