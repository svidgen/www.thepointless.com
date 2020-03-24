<?php

class ConnectionProxy {

	private $client = null;
	private $server = null;
	private $worker = null;

	function __construct($client, $worker) {
		$this->worker = $worker;
		$this->client = $client;
		$this->server = $worker->connect();
	}

	function copy_data($source_name, $destination_name) {
		if (!$this->$source_name->is_connected()) {
			return;
		}
		if ($data = $this->$source_name->read()) {
			$this->$destination_name->write($data);
			$bytes = strlen($data);
			print "Proxied {$bytes} bytes from {$source_name} to {$destination_name}.\n";
		}
	}

	function is_complete() {
		return !($this->client->is_connected() && $this->server->is_connected());
	}

	function tick() {
		if ($this->is_complete()) {
			$this->close();
			return false;
		}

		$this->copy_data('client', 'server');
		$this->copy_data('server', 'client');

		return true;
	}

	function close() {
		$this->worker->close();
		$this->client->close();
		$this->client = null;
		$this->worker = null;
	}
}

?>
