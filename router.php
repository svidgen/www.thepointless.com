<?php

include('env.php');
ini_set('display_errors', '1');

$filename = $_SERVER['REQUEST_URI'];
$filename = preg_replace("/\?.*$/", "", $filename);
if (!$filename || $filename == '/') {
	$filename = 'index.php';
}

function safe_path($path) {
	return preg_replace('/\.+/', '.', $path);
}

function execute($page, $vars=array()) {
	extract($vars);
	ob_start();
	include("{$page}.inc");
	$content = ob_get_contents();
	ob_end_clean();
	return $content;
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
	print execute(safe_path("themes/{$theme}"), [
		'template_page_data' => execute(safe_path("pages/{$page}"))
	]);
}

function load_file($file, $theme) {
	print execute(safe_path("themes/{$theme}"), [
		'template_page_data' => file_get_contents(safe_path($file))
	]);
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

// include('index.php')

?>
