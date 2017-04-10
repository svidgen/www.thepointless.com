<?php

// start benchmarking
$__pageload_start = microtime(true);


$base_domain = 'www.thepointless.com';
$cookie_domain = '.thepointless.com';
$base_url = "http://{$base_domain}/";
$secure_base_url = "http://{$base_domain}/";


$default_page = 'index';
$default_theme = 'default';
// $prefer_theme = false;
// $require_theme = false;
$meta_title = '';
// $html_title = '';
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
$db_default_user = 'root';
$db_default_pass = '';
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

// define a debug variable to dump lines into
$debug_string = '';

// bookmarks host
$bookmarks_host = 'www.svidgen.com';

// trulygui host
$trulygui_host = 'www.trulygui.com';


// use zlib on-the-fly compression
// ini_set('zlib.output_compression', '1');

// level between 1 and 9 or -1 to let server decide
// ini_set('zlib.output_compression_level', '-1');

// turn off output handlers
// ini_set('zlib.output_handler', '');



// now, if site_config.inc exists, load it up ...
if (file_exists('site_config.inc')) {
	if (!@include('site_config.inc')) {
		// that's OK ... 
	}
}

// common libraries
require_once('includes/util.inc');
require_once('includes/dbconnect.inc');
require_once('includes/auth.inc');


// needs to be set after util.inc is included:
set_error_handler('handle_error');


// conditional libraries
if (function_exists('apc_fetch')) {
	require_once('includes/apc_cache.inc');
} else {
	require_once('includes/mysql_cache.inc');
}


// check for highly non-compliant browsers (IE < 7)
if (preg_match("/MSIE 6|5/", $_SERVER['HTTP_USER_AGENT'])) {
	$old_browser = true;
} else {
	$old_browser = false;
}


// fix GET and POST data for MySQL queries
if (get_magic_quotes_gpc()) {
	// print "<!-- magic quotes is on -->\n";
	
	// magic quotes is OFF! run escaping on GET, POST, and COOKIE variables
	foreach ($_GET as $key => $value) {
		$_GET[$key] = stripslashes($value);
	}

	foreach ($_POST as $key => $value) {
		$_POST[$key] = stripslashes($value);
	}
	
	foreach ($_COOKIE as $key => $value) {
		$_COOKIE[$key] = stripslashes($value);
	}
}


// use the PHP INI max session lifetime, rather than *setting* it here.
// this will avoid conflicts with other apps and force us to set a global
// max session lifetime.
$session_duration = (int)ini_get("session.gc_maxlifetime");

// start (or attach to) the session 
session_set_cookie_params($session_duration, '/', $cookie_domain);
session_name($session_name);
session_start();


// if the .project_stop file exists, the project has been stopped or paused
// for some reason. it is the responsibility of .project_stop to check the page
// and change $template_content as necessary to an info page explaining why
// the requested page is not available (project over, paused, w/e).
if (is_file('.project_stop')) {
	include('.project_stop');
}


// buffer the output of the page file, so it can interact with the template
// and send browser headers
ob_start();

// if a page is designate on in the query string, use it.  otherwise, use the
// default page name
if (!isset($_GET['driver_c'])) {
	$_GET['driver_c'] = $default_page;
}

// process redirects
if (file_exists('includes/redirects.inc')) {
	if (!@include('includes/redirects.inc')) {
		// that's OK ...
	}
}


// pages will use a .inc extension
// also, remove .'s from the pagename so parent directories
// cannot be accessed. might have to put a fix in for unicode
// .'s as well?
$template_content = 'pages/' . str_replace('.', '', $_GET['driver_c']) . '.inc';

unset($_GET['driver_c']);

// if the page name is not a file or cannot be included for some reason,
// use the broken fingers message for page data
if ((!is_file($template_content)) || (!$__content_rv = include($template_content))) {
	header('HTTP/1.1 404 Not Found');
	$meta_title = "404 - Not Found";
	print "
		Whatever the hell you're looking for ain't here!
	";
}

// grab output buffered contents and stop buffering
$template_page_data = ob_get_contents();
ob_end_clean();


// if an html_title has not been set, us the meta_title
if (!isset($html_title)) {
	$html_title = $meta_title;
}

// use output buffering again for the template, in case it needs to modify
// headers in any way
ob_start();

// if a theme is designated in the query string, use it.  otherwise, use the
// default template 

// if there is a preferred theme, use that
if (isset($prefer_theme) && $prefer_theme) {
	$__theme = $prefer_theme;
}

// however, if a theme has been specified, use that
if (isset($_GET['driver_theme']) && $_GET['driver_theme']) {	
	$__theme = $_GET['driver_theme'];
}

// and lastly, if there is a required theme, use that instead
if (isset($require_theme) && $require_theme) {
	$__theme = $require_theme;
}

// now, check and fix the theme value
if (!isset($__theme)) {
	$__theme = $default_theme;
}

// templates will use a .template extension
$template_file = 'themes/' . str_replace('.', '', $__theme) . '.inc';
// $template_file = $_GET['theme'] . '.inc';


// if the template doesn't exist or cannot be included for some reason,
// use a very bare-bones template
if ((!is_file($template_file)) || (!include($template_file))) {

	print '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<title>' . $meta_title . '</title>
	<meta name="keywords" content="' . $meta_keywords . '" />
	<meta name="description" content="' . $meta_description . '" />
</head>
<body>' . $template_page_data . '</body>
</html>';

}


// reset/extend the SESSION cookie if already set
if (isset($_COOKIE[$session_name])) {
	@setcookie($session_name, $_COOKIE[$session_name], time() + $session_duration, "/", $cookie_domain);
}


// end buffering and flush all output to the client
ob_end_flush();


?>
