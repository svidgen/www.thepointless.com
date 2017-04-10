<?php

	$do_not_cache = true;

	require_once('includes/auth.inc');

	$user_data = get_authenticated_user();
	$pu = trim_user_fat($user_data);

	$menu_html = user_menu(@$_GET['return']);

	$rv = json_encode(array(
		'menu' => $menu_html,
		'user' => $pu
	));

	if (@$_GET['cb']) {
		print "{$_GET['cb']}({$rv});";
	} else {
		print $menu_html;
	}

?>
