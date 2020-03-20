<?php

$port = $argv[1];
$poolsize = $argv[2];
$pool = [];
$pool_fds = [];


function create_worker($port) {
	$command = "php -S 0.0.0.0:{$port} -t . http.php";
	print "Attempting to create worker:\n> {$command}\n";
	$worker = popen($command, 'r');
	print "worker created: {$worker}\n";
	return $worker;
}


function kill_worker($port) {
	global $pool_fds, $pool;
	pclose($pool_fds[$port]);
	unset($pool_fds[$port]);
	unset($pool[$port]);
}


function read_to_end(&$socket) {
	return fread($socket, 1000000);
}


function assign_to_worker(&$pool, &$connection) {
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


function get_free_worker_port(&$pool) {
	foreach ($pool as $port => $connection) {
		if (!$connection) {
			return $port;
		}
	}
	return null;
}


function forward_request(&$pool, $port, &$connection) {
	$w = socket_create(AF_INET, SOCK_STREAM, getprotobyname('tpc'));
	socket_connect($w, '127.0.0.1', $port);
	$pool[$port]['worker'] = $w;
	$data = read_to_end($connection);
	socket_write($w, $data);

	print "Forwarded to worker {$port}.\n";
}


function check_for_responses(&$pool) {
	foreach ($pool as $port => $request) {
		$worker = $request['worker'];
		$client = $request['client'];
		if ($client && $worker) {
			socket_set_nonblock($worker);
			if ($chars = socket_read($worker, 1000000)) {
				print "Streaming response from {$port}.\n";
				fwrite($client, $chars);
				fclose($client);
				socket_close($worker);
				$pool[$port] = null;
			}
		}
	}
}


function send_response(&$pool, $data) {
	$request = $pool[$port];
	fwrite($request['client'], $data);
	fclose($request['client']);
	$pool[$port] = null;
}


function signal_handler($signal) {
	global $socket, $pool;
	print "Quitting gracefully.\n";
	foreach (array_keys($pool) as $port) {
		kill_worker($port);
	}
	if ($socket) {
		fclose($socket);
	}
	exit(0);
}


for ($i = 0; $i < $poolsize; $i++) {
	$child_port = $port + $i + 1;
	$pool[$child_port] = null;
	$pool_fds[$child_port] = create_worker($child_port);
}


pcntl_signal(SIGTERM, "signal_handler");
pcntl_signal(SIGHUP, "signal_handler");
pcntl_signal(SIGINT, "signal_handler");


$socket = stream_socket_server("tcp://0.0.0.0:{$port}");
if (!$socket) {
	print "Could not bind to port {$port}. Quitting.\n";
	exit(0);
}

stream_set_blocking($socket, 0);
print "Listening on port {$port}.\nPress ctrl+c to exit ...\n";

while (true) {
	$connection = @stream_socket_accept($socket, 0.01);
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
