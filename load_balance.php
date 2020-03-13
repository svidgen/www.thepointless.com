<?php

$port = 8888;
$pool_start_port = 8890;
$poolsize = 4;

$pool = [];

for ($i = 0; $i < $poolsize; $i++) {
	$pool_port = $pool_start_port + $i;
	$pool[$pool_port] = false;
}


function read_to_end($socket) {
	return socket_read($socket, 1000000);
}


function assign_to_worker($pool, $connection) {
	while (!$port = get_free_worker_port($pool)) {
		usleep(50000);
	}
	print "Assigned to {$port}.\n";
	$pool[$port] = [
		'client' => $connection,
		'worker' => null,
		'buffer' => []
	];
	forward_request($pool, $port, $connection);
}


function get_free_worker_port($pool) {
	foreach ($pool as $port => $connection) {
		if (!$connection) {
			return $port;
		}
	}
	return null;
}


function forward_request($pool, $port, $connection) {
	print "Attempting to connect to worker on port {$port}.\n";
	$fp = fsockopen('127.0.0.1', $port);
	print "Opened connection to worker on port {$port}.\n";

	stream_set_timeout($fp, 0, 50000);
	stream_set_blocking($fp, false);
	$pool[$port]['worker'] = $fp;

	print "Configured worker socket.\n";

	$data = read_to_end($connection);
	print "Read data from client.\n\n";

	fwrite($fp, $data);
	print "Wrote data to worker.\n";
}


function check_for_responses($pool) {
	print "Checking for data from worker ... \n";
	foreach ($pool as $port => $request) {
		$worker = $request['worker'];
		if ($worker) {
			$data = fgets($worker);
			if ($data) {
				print "Found response data from worker on port {$port}.\n";
				$request['buffer'][] = $data;
			}
			if (feof($worker)) {
				print "Found a completed response. Sending...\n";
				fclose($worker);
				send_response($pool, $port);
			}
		}
	}
}


function send_response($pool, $port) {
	$request = $pool[$port];
	$data = join('', $request['buffer']);
	socket_write($request['client'], $data);
	socket_close($request['client']);
	$pool[$port] = null;
}


function signal_handler($signal) {
	global $socket;
	print "Quitting gracefully.";
	if ($socket) {
		socket_close($socket);
	}
	exit(0);
}

pcntl_signal(SIGTERM, "signal_handler");
pcntl_signal(SIGHUP, "signal_handler");
pcntl_signal(SIGINT, "signal_handler");

$socket = socket_create_listen($port);
if (!$socket) {
	print "Could not bind to port {$port}. Quitting.\n";
	exit(0);
}

socket_set_nonblock($socket);
print "Listening on port {$port}.\nPress ctrl+c to exit ...\n";

while (true) {
	$connection = socket_accept($socket);
	if ($connection) {
		print "Connection accepted.\n";
		$data = assign_to_worker($pool, $connection);
	} else {
		usleep(50000);
	}
	check_for_responses($pool);
	pcntl_signal_dispatch();
}


?>
