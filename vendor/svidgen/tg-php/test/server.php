<?php

//
// tests the router and dev server, each of which are just easier and more
// meaningful to test together.
// 

require('background-job.php');

// `php -S` behaves strangely *and differently by OS* with regards to
// how docroot and router are specified in child procs.
// safest solution is to use absolute path for *both*.
$server_port = 39000;
$server_args = join(' ', [
	"--port={$server_port}",
	'--docroot=' . getcwd() . '/test/www',
	'--router=' . getcwd() . '/bin/router.php'
]);
$server_command = 'php bin/run.php ' . $server_args;
print "Running: {$server_command}\n";
$server = new BackgroundJob($server_command);
usleep(250000);


function cleanup_shutdown_server($runner) {
	global $server;
	$server->stop();
}

function get_page($path) {
	global $server_port;
	$data = file_get_contents("http://127.0.0.1:{$server_port}/{$path}");
	return $data;
}

function get_page_response_header($path) {
	global $server_port;
	@file_get_contents("http://127.0.0.1:{$server_port}/{$path}");
	return $http_response_header;
}

function post_page($path, $fields) {
	global $server_port;

	$http_options = [
		'http' => [
			'method' => 'POST',
			'header' => join("\r\n", [
				'Content-type: application/x-www-form-urlencoded',
				'Connection: close'
			]),
			'content' => http_build_query($fields),
		]
	];
	$context = stream_context_create($http_options);
	return file_get_contents(
		"http://127.0.0.1:{$server_port}/{$path}",
		false,
		$context
	);
}

function post_api($path, $calls, $token = null) {
	// response object looks like
	// ```
	// TG.API.cb("TOKEN",0,<request 1 response object>);
	// TG.API.cb("TOKEN",1,<request 2 response object>);
	// ... etc. ...
	// ```

	$token = $token ?? dechex(rand());
	$response = post_page($path . '?format=jsonp', [
		'tg-t' => $token,
		'tg-a' => json_encode($calls)
	]);
	$lines = preg_split("/\R/", $response);

	$responses = [];
	foreach ($lines as $l) {
		if (preg_match("/^TG\.API\.cb\(\"{$token}\",[\d]+,(.+)\);$/", $l, $m)) {
			$responses[] = json_decode($m[1], $assoc=true);
		}
	}

	return $responses;
}

function api_request($method, $args) {
	return [
		'f' => $method,
		'p' => $args
	];
}


function test_can_get_html_page($runner) {
	$page = get_page('html-page');

	$expected = file_get_contents('test/www/html-page.html');

	$runner->assert($page);
	$runner->assert_equal($page, $expected);
}

function test_router_can_get_markdown_page($runner) {
	$page = get_page('markdown-page');

	// reminder: file() reads text file lines *as an array*
	$markdown = file('test/www/markdown-page.md');
	$title = preg_replace("/^# /", '', trim($markdown[0]));

	$runner->assert_contains($page, "<title>{$title}</title>");
	$runner->assert_contains($page, "<h1>{$title}</h1>");
}

function test_router_returns_404_for_non_existent_file($runner) {
	$headers = get_page_response_header('page-that-does-not-exist');
	$runner->assert_contains($headers[0], '404');
}

function test_router_returns_404_for_private_path($runner) {
	// that is, paths with a 'private' folder in there somewhere
	$headers = get_page_response_header('private/index.md');
	$runner->assert_contains($headers[0], '404');
}

function test_router_returns_404_for_hidden_folder($runner) {
	// that is, folders that start with a dot
	$headers = get_page_response_header('.hidden/index.md');
	$runner->assert_contains($headers[0], '404');
}

function test_router_returns_404_for_hidden_files($runner) {
	// that is, folders that start with a dot
	$headers = get_page_response_header('.hidden-file.md');
	$runner->assert_contains($headers[0], '404');
}

function test_router_return_tg_core($runner) {
	$headers = get_page_response_header('~tg-php/tg-core.js');
	$runner->assert_contains($headers[0], '200');

	$page = get_page('~tg-php/tg-core.js');
	$runner->assert($page);
}

function test_router_return_tg_all($runner) {
	$headers = get_page_response_header('~tg-php/tg-all.js');
	$runner->assert_contains($headers[0], '200');

	$page = get_page('~tg-php/tg-all.js');
	$runner->assert($page);
}

function test_router_returns_tg_libs_with_querystring($runner) {
	$headers = get_page_response_header('~tg-php/tg-all.js?v=123');
	$runner->assert_contains($headers[0], '200');

	$page = get_page('~tg-php/tg-all.js?v=123');
	$runner->assert($page);
}

function test_can_get_php_object($runner) {
	$page = get_page('php-object');

	$expected_features = [
		"<tgt:phpobject",
		'id="some-id"',
		'rando_attribute="some-attribute-value"'
	];
	foreach($expected_features as $feature) {
		$runner->assert_contains($page, $feature);
	}

	$unexpected_features = [
		'private_attribute="private-value"'
	];
	foreach($unexpected_features as $feature) {
		$runner->assert_not_contains($page, $feature);
	}
}

function test_can_get_jsonp_api_definition($runner) {
	$result = get_page('php-object?format=jsonp');

	// just a couple sanity checks
	$runner->assert_contains($result, 'var TGT=TGT||{};');
	$runner->assert_contains($result, 'TGT.PhpObject=TGT.PhpObject||{};');
	$runner->assert_contains($result, 'TGT.PhpObject.dotCat=function()');
}

function test_api_yells_about_non_existent_methods($runner) {
	$results = post_api('php-object', [
		api_request('TGT.PhpObject.NOTdotCat', ['left','right'])
	]);

	$runner->assert_json_equal($results[0], [
		'tg-api-error' => 'NO SUCH FUNCTION']
	);
}

function test_can_call_php_object_methods($runner) {
	$results = post_api('php-object', [
		api_request('TGT.PhpObject.dotCat', ['left','right'])
	]);

	$runner->assert_equal($results[0], 'left.right');
}

function test_can_call_multiple_methods_at_once($runner) {
	$results = post_api('php-object', [
		api_request('TGT.PhpObject.dotCat', ['1','2']),
		api_request('TGT.PhpObject.dotCat', ['3','4']),
		api_request('TGT.PhpObject.dotCat', ['5','6'])
	]);

	$runner->assert_equal($results[0], '1.2');
	$runner->assert_equal($results[1], '3.4');
	$runner->assert_equal($results[2], '5.6');
}

?>
