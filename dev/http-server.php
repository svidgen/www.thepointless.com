<?php

require('worker-pool.php');
require('stream-connection.php');
require('connection-proxy.php');

class HttpServer {

	private $server = null;
	private $worker_pool = null;
	private $clients = [];
	private $connections = [];

	function __construct($port, $poolsize, $docroot, $router) {
		$this->worker_pool = new WorkerPool($port, $poolsize, $docroot, $router);
		$this->server = stream_socket_server("tcp://0.0.0.0:{$port}");
		if (!$this->server) {
			throw new Exception("Could not bind to port {$port}");
		}
		stream_set_blocking($this->server, false);
		print "Listening on port {$port} ...\n";
		print "Press Ctrl-C to exit.\n\n";
	}

	function terminate($signal) {
		print "Received signal ({$signal}).\nExiting ... \n";
		fclose($this->server);
		$this->worker_pool->terminate();
		exit(0);
	}

	function run() {
		if (function_exists('pcntl_signal')) {
			pcntl_signal(SIGTERM, [$this, "terminate"]);
			pcntl_signal(SIGHUP, [$this, "terminate"]);
			pcntl_signal(SIGINT, [$this, "terminate"]);
		}

		while (true) {
			$this->tick();
			function_exists('pcntl_signal_dispatch') ? pcntl_signal_dispatch() : null;
			if (!$this->has_work_to_do()) {
				usleep(50 * 1000);
			}
		}
	}

	function enqueue_pending_clients() {
		if ($client = @stream_socket_accept($this->server, 0.001)) {
			print "Connection accepted.\n";
			$this->clients[] = new StreamConnection($client);
		}
	}

	function dequeue_client() {
		if (sizeof($this->clients) > 0) {
			$client = array_shift($this->clients);
			return $client;
		} else {
			return null;
		}
	}

	function has_waiting_clients() {
		return sizeof($this->clients) > 0;
	}

	function has_waiting_workers() {
		return $this->worker_pool->has_free_workers();
	}

	function has_active_connections() {
		return sizeof($this->connections) > 0;
	}

	function has_work_to_do() {
		return $this->has_waiting_clients() || $this->has_active_connections();
	}

	function connect_clients() {
		while ($this->has_waiting_clients() && $this->has_waiting_workers()) {
			$client = $this->dequeue_client();
			if ($client) {
				$worker = $this->worker_pool->get_free_worker();
				$this->connections[] = new ConnectionProxy(
					$client,
					$worker
				);
				print "Established client-worker connection.\n";
			}
		}
	}

	function tick_connections() {
		foreach ($this->connections as $i => $connection) {
			if (!$connection->tick()) {
				print "Transaction complete.\n";	
				$this->remove_connection($i);
			}
		}
	}

	function remove_connection($index) {
		unset($this->connections[$index]);
	}

	function tick() {
		$this->enqueue_pending_clients();
		$this->connect_clients();
		$this->tick_connections();
	}

}

?>
