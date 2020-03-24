<?php

class StreamConnection {

	private $stream = null;

	function __construct($stream) {
		$this->stream = $stream;
		stream_set_blocking($this->stream, false);
	}

	function is_connected() {
		if ($this->stream === null) {
			return false;
		}

		if (feof($this->stream)) {
			$this->close();
			return false;
		}

		return true;
	}

	function close() {
		fclose($this->stream);
		$this->stream = null;
	}

	function read() {
		if (!$this->is_connected()) {
			return null;
		}

		return fread($this->stream, 8 * 1024);
	}

	function write($data, $timeout = 1) {
		if (!$this->is_connected()) {
			return null;
		}

		if (!$data) {
			return true;
		}

		$time_limit = microtime(1) + $timeout;
		while (microtime(1) < $time_limit) {
			$bytes_written = fwrite($this->stream, $data);
			if ($bytes_written === false) {
				// ruhoh! try again shortly.
				usleep(100);
			} else {
				return true;
			}
		}

		throw new Exception("Stream write timed out.");

		return false;
	}

}

?>
