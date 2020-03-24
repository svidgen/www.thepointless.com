<?php

if (sizeof($argv) < 2 || (int)$argv[1] < 80) {
	print "Usage: php run.php <port >= 80> [number-of-workers]\n\n";
	exit;
}

$port = (int)$argv[1];
$poolsize = (isset($argv[2]) && (int)$argv[2] > 0) ? (int)$argv[2] : 8;


require(__DIR__ . '/../dev/http-server.php');

$server = new HttpServer($port, $poolsize);
$server->run();

?>
