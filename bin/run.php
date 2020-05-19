<?php

$options = [
	'port::' => '8000',
	'workers::' => 8,
	'docroot::' => '.',
	'router::' => 'router.php'
];

$cli_args = getopt(null, array_keys($options));

$port = @$cli_args['port'] ?? $options['port::'];
$workers = @$cli_args['workers'] ?? $options['workers::'];
$docroot = @$cli_args['docroot'] ?? $options['docroot::'];
$router = @$cli_args['router'] ?? $options['router::'];


require(__DIR__ . '/../dev/http-server.php');

$server = new HttpServer($port, $workers, $docroot, $router);
$server->run();

?>
