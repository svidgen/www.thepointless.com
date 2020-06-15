<?php

$config = get_config();

// start (or attach to) the session 
session_set_cookie_params(
	$config['session_duration'], '/', $config['cookie_domain']
);
session_name($config['session_name']);
session_start();

// `.project_stop` shall be used to put the site into stop/maintenance mode.
if (is_file('.project_stop')) {
	include('.project_stop');
	exit();
}

// reset/extend the SESSION cookie if already set
if (isset($_COOKIE[$config['session_name']])) {
	@setcookie($config['session_name'], $_COOKIE[$config['session_name']], time() + $config['session_duration'], "/", $config['cookie_domain']);
}

?>