<?php

ini_set('display_errors', '1');
define('CONTENT', 'content');
require_once('env.php');

$filename = $_SERVER['REQUEST_URI'];
$filename = preg_replace("/\?.*$/", "", $filename);
if (!$filename || $filename == '/') {
	$filename = 'index';
}

function safe_path($path) {
	$path = preg_replace('/\.+/', '.', $path);
	return preg_replace('/\\/+/', '/', $path);
}

function include_path($path) {
	$suffixes = [
		'.inc',
		'index.inc',
		'/index.inc'
	];
	foreach ($suffixes as $suffix) {
		$potential_path = "{$path}{$suffix}";
		if (file_exists($potential_path)) {
			return $potential_path;
		}
	}
	return null;
}

function execute($script, $args=array()) {
	extract(get_config());
	// extract($args);

	$include_path = include_path($script);
	if (!$include_path) {
		throw new Exception("path not found.");
	}

	// print "path: {$include_path}";
	// exit();

	ob_start();
	include($include_path);
	$content = ob_get_contents();
	ob_end_clean();

	$exports = get_defined_vars();
	$exports[CONTENT] = $content;
	unset($exports['script']);
	return $exports;
}

function route($routes, $path) {
	foreach ($routes as $route => $loader) {
		if (preg_match($route, $path, $matches)) {
			call_user_func_array($loader, array_slice($matches, 1));
			break;
		}
	}
}

function load_page($page, $theme) {
	$page_data = execute(safe_path("pages/{$page}"));
	if (isset($page_data['require_theme'])) {
		$theme = $page_data['require_theme'];
	}
	print execute(safe_path("themes/{$theme}"), $page_data)[CONTENT];
}

function load_file($file, $theme) {
	print execute(
		safe_path("themes/{$theme}"),
		[CONTENT => file_get_contents(safe_path($file))]
	)[CONTENT];
}

$routes = [
	"/^\/?(images\/.+\.([^.]+))$/" => 'load_file',
	"/^\/?(apps\/.+\.([^.]+))$/" => 'load_file',
	"/^([^.]+)$/" => function($page) {
		load_page($page, 'default');
	},
	"/^(.+)\.([^.]*)$/" => 'load_page',
	"/^(.+)$/" => function($page) {
		load_page("{$page}/index", 'default');
	}
];

route($routes, $filename);

?>
