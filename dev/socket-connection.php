<?php

if (!defined('MSG_DONTWAIT')) {
	define('MSG_DONTWAIT', 0x20);
}

class SocketConnection {

	private $socket = null;

	function __construct($socket) {
		socket_set_nonblock($socket);
		$this->socket = $socket;
	}

	function read() {
		if (!$this->is_connected()) {
			return null;
		}

		$data = '';
		$bytes_read = socket_recv($this->socket, $data, 8 * 1024, MSG_DONTWAIT);
		if ($bytes_read === 0) {
			print "Zero bytes read from socket.\n";
			socket_close($this->socket);
			$this->socket = null;
		} elseif ($bytes_read > 0) {
			return $data;
		}
	}

	function write($data) {
		if (!$this->is_connected()) {
			return null;
		}

		return socket_write($this->socket, $data);
	}

	function is_connected() {
		return $this->socket === null ? false : true;
	}

	function close() {
		if ($this->is_connected()) {
			socket_close($this->socket);
			$this->socket = null;
		}
	}
}

?>
