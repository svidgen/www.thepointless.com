<?php

define('TPDC_CONFIG_SINGLETON', '__tpdc_config_singleton');

function get_config() {
	if (!isset($GLOBALS[TPDC_CONFIG_SINGLETON])) {
		$GLOBALS[TPDC_CONFIG_SINGLETON] = make_config();
	}
	return $GLOBALS[TPDC_CONFIG_SINGLETON];
}

function make_config() {
	$base_domain = 'www.thepointless.com';
	$cookie_domain = '.thepointless.com';
	$base_url = "http://{$base_domain}/";
	$secure_base_url = "http://{$base_domain}/";

	$default_page = 'index';
	$default_theme = 'default';
	$meta_title = '';
	$meta_description = '';
	$meta_keywords = '';

	$general_version = 492;

	$cse_adposition = '9'; // 9 = right; 10 = top and right; 11 = top and bottom;
	$google_analytics_id = 'UA-920576-1';

	$session_name = 'pointless_session';
	$atoken_name = 'p_atoken';
	$signin_page = 'signin';

	// database connection values
	$db_default_host = 'localhost';
	$db_default_user = 'stickman';
	$db_default_pass = 'temp-password-for-bootstrapping';
	$db_default_db = 'pointless';

	$simulate_apc_cache = false;

	// turn debugging on/off.
	// the implications of this vary for each page and library.
	// but, we figured it'd be nice to have a global variable to
	// turn these sorts of things on and off all at once.
	$debug_mode = false;

	// to be appended to with debug info.
	$debug_string = '';

	// bookmarks host
	$bookmarks_host = 'www.svidgen.com';

	// trulygui host
	$trulygui_host = 'www.trulygui.com';

	// use the PHP INI max session lifetime, rather than *setting* it here.
	// this will avoid conflicts with other apps and force us to set a global
	// max session lifetime.
	$session_duration = (int)ini_get("session.gc_maxlifetime");

	// now, if site_config.inc exists, load it up ...
	if (file_exists('site_config.inc')) {
		if (!@include('site_config.inc')) {
			// that's OK ... 
		}
	}

	$template_page_data = '';

	$vars = get_defined_vars();
	foreach ($GLOBALS as $key => $var) {
		unset($vars[$key]);
	}

	return $vars;
}

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

// common libraries and behaviors
require_once('includes/error_handling.php');
require_once('includes/util.inc');
require_once('includes/dbconnect.inc');
require_once('includes/auth.inc');

?>
