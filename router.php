<?php

ini_set('display_errors', '1');
define('CONTENT', 'content');
require_once('env.php');

$filename = $_SERVER['REQUEST_URI'];
$filename = preg_replace("/\?.*$/", "", $filename);
if (!$filename || $filename == '/') {
	$filename = 'index.php';
}

function safe_path($path) {
	return preg_replace('/\.+/', '.', $path);
}

function execute($script, $args=array()) {
	extract(get_config());
	// extract($args);

	ob_start();
	include("{$script}.inc");
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
