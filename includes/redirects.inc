<?php

//
// legacy pages
//
// if the default page is being requested, perform any necessary redirects
// to accomodate for the old URL scheme
//
if ($_GET['driver_c'] == 'index' || $_GET['driver_c'] == '/index') {
	if (isset($_GET['c']) && $_GET['c']) {
		$legacy_redirects = array(
			'dot' => 'dots',
			'reddot' => 'reddot',
			'greendot' => 'greendot',
			'clickometer' => 'clickometer'
		);

		if ($legacy_redirects[$_GET['c']]) {
			redirect($base_url . $legacy_redirects[$_GET['c']]);
		}
	}
}


//
// miscellaneous moved pages
//
$pagemap = array(
	'/pointlistings' => 'small-potatoes',
	'/add_pointlisting' => 'add-potato'
);

if (isset($pagemap[$_SERVER['SCRIPT_NAME']])) {
	$__get = $_GET;
	unset($__get['driver_c']);
	unset($__get['driver_theme']);
	$__qs = http_build_query($__get);
	redirect($base_url . $pagemap[$_SERVER['SCRIPT_NAME']] . '?' . $__qs);
}

?>
