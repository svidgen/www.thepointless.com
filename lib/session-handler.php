<?php

namespace TG;

require_once(__DIR__ . '/session.php');

class DocumentSessionHandler {

	function open($savePath, $sessionName) {
		// N/A to document handler
		return true;
	}

	function close() {
		// N/A to document handler
		return true;
	}

	function read($id) {
		$session = \TG\Session::get($id);
		if ($session) {
			return $session->data;
		} else {
			return "";
		}
	}

	function write($id, $data) {
		$session = new \TG\Session();
		$session->initialize(array('data' => $data));
		return (bool)$session->save($id);
	}

	function destroy($id) {
		$session = \TG\Session::get($id);
		if ($session) {
			$session->delete();
		}
		return true;
	}

	// not yet implemented
	function gc($maxlifetime) {
		return true;

		foreach (glob("$this->savePath/sess_*") as $file) {
			if (filemtime($file) + $maxlifetime < time()
				&& file_exists($file)
			) {
				unlink($file);
			}
		}

		return true;
	}
}

$handler = new DocumentSessionHandler();
session_set_save_handler(
	array($handler, 'open'),
	array($handler, 'close'),
	array($handler, 'read'),
	array($handler, 'write'),
	array($handler, 'destroy'),
	array($handler, 'gc')
);

// the following prevents unexpected effects when using objects as save
// handlers ... according to php.net.
register_shutdown_function('session_write_close');

ini_set('session.cookie_lifetime', 60 * 60 * 24 * 365 * 20);

?>
