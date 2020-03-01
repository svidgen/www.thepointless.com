<?php

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

// $cse_version = 142;
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


// facebook API info
$facebook_appId = '';
$facebook_appSecret = '';
$facebook_cookie_domain = '.thepointless.com';
$facebook_admins = '';


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

// now, if site_config.inc exists, load it up ...
if (file_exists('site_config.inc')) {
	if (!@include('site_config.inc')) {
		// that's OK ... 
	}
}

// use the PHP INI max session lifetime, rather than *setting* it here.
// this will avoid conflicts with other apps and force us to set a global
// max session lifetime.
$session_duration = (int)ini_get("session.gc_maxlifetime");

// `handle_error` defined in `util.inc`
set_error_handler('handle_error');

// start (or attach to) the session 
session_set_cookie_params($session_duration, '/', $cookie_domain);
session_name($session_name);
session_start();

// `.project_stop` shall be used to put the site into stop/maintenance mode.
if (is_file('.project_stop')) {
	include('.project_stop');
	exit();
}

// reset/extend the SESSION cookie if already set
if (isset($_COOKIE[$session_name])) {
	@setcookie($session_name, $_COOKIE[$session_name], time() + $session_duration, "/", $cookie_domain);
}
// common libraries
require_once('includes/util.inc');
require_once('includes/dbconnect.inc');
require_once('includes/auth.inc');


?>
