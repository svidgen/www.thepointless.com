<?php

// start benchmarking
$__pageload_start = microtime(true);

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

try {
	if (isset($_GET['driver_c_raw'])) {
		$content_file = preg_replace('/\.+/', '.', $_GET['driver_c_raw']);
		$template_page_data = file_get_contents($filename);
	} else {
		$content_file = 'pages/' . str_replace('.', '', $_GET['driver_c']) . '.inc';
		ob_start();
		include($filename);
		$template_page_data = ob_get_contents();
		ob_end_clean();
	}
} catch (Exception $e) {
	header('HTTP/1.1 404 Not Found');
	$meta_title = "404 - Not Found";
	print "
		Whatever you're looking for ain't here!
	";
}

unset($_GET['driver_c']);

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

// templates will use a .inc extension (just like pages)
$template_file = 'themes/' . str_replace('.', '', $__theme) . '.inc';


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



// end buffering and flush all output to the client
ob_end_flush();


?>
