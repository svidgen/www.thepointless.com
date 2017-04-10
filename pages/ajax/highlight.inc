<?php

	$require_theme = 'php';


	//
	// check access
	//

	// domains that my use this highlighter
	$domains = array(
		'thepointless.com',
		'svidgen.com',
		'angrystickman.blogspot.com'
	);

	if (isset($_SERVER['HTTP_REFERER'])) {
		$referer_parts = parse_url($_SERVER['HTTP_REFERER']);
		$host = $referer_parts['host'];
		$access = false;
		foreach ($domains as $d) {
			if (preg_match($d . '$', $host)) {
				$access = true;
				break;
			}
		}

		if ($access) {
			return true;
		}
	}


	//
	// perform highlighting on POST[source]
	//
	highlight_string($_GET['s']);
	

?>
