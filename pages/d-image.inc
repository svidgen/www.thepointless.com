<?php

	$require_theme = "php";

	require_once('includes/game.inc');

	$image = null;
	if (isset($_GET['url']) && preg_match("/^https?:\/\//", $_GET['url'])) {
		$image = file_get_contents($_GET['url']);
	} else {
		$image = select_image(
			@$_GET['id'] ? $_GET['id'] : 1
		);
	}

	if ($image != null) {
		if ($image['mimetype'] == 'image/svg+xml') {
			// no resizing necessary
		} else if (isset($_GET['fb'])) {
			if ($_GET['fb'] == 'lg') {
				$w = 1200;
				$h = 630;
			} else {
				$w = 600;
				$h = 315;
			}
			$image = build_image_row('image/png', $image, $w, $h, false, 'center');
		} else if (isset($_GET['w']) && isset($_GET['h'])) {
			$w = min($_GET['w'], 1200);
			$w = max($w, 16);
			$h = min($_GET['h'], 1200);
			$h = max($h, 16);
			$image = build_image_row($image['mimetype'], $image['data'], $w, $h, @$_GET['p'] ? (bool)$_GET['p'] : 0);
		}


		header("Content-type: " . $image['mimetype']);
		send_cache_control_headers();
		header("Content-length: " . strlen($image['data']));
		print $image['data'];

		exit();
	} else {
		throw new Exception("Image not found.");
	}

?>
