<?php

ini_set('display_errors', '1');

define('CONTENT', 'template_page_data');

require_once('env.php');

$filename = $_SERVER['REQUEST_URI'];
$filename = preg_replace("/\?.*$/", "", $filename);
if (!$filename || $filename == '/') {
	$filename = 'index.php';
}

function safe_path($path) {
	return preg_replace('/\.+/', '.', $path);
}

function execute($page, $args=array()) {
	ob_start();
	include("{$page}.inc");
	$content = ob_get_contents();
	ob_end_clean();

	$exports = get_defined_vars();
	$exports[CONTENT] = $content;
	unset($exports['page']);
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
	print execute(
		safe_path("themes/{$theme}"),
		execute(safe_path("pages/{$page}"))
	)[CONTENT];
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
