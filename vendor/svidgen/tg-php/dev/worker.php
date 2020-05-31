<?php

require(__DIR__ . '/socket-connection.php');
require(__DIR__ . '/../lib/background-job.php');

class Worker {

	private $proc;
	public $port;
	public $connection = null;
	public $pool = null;

	function __construct($pool, $port, $docroot, $router) {
		$this->pool = $pool;
		$this->port = $port;
		$command = "php -S 0.0.0.0:{$port} -t {$docroot} {$router}";
		$this->proc = new BackgroundJob($command);
	}

	function terminate() {
		$this->proc->stop();
	}

	function close() {
		$this->connection->close();
		$this->pool->release($this);
	}

	function connect() {
		try {
			$tcp = getprotobyname('tcp');
			$socket = socket_create(AF_INET, SOCK_STREAM, $tcp);
			socket_connect($socket, '127.0.0.1', $this->port);
			$this->connection = new SocketConnection($socket);
			return $this->connection;
		} catch (\Error $e) {
			if (preg_match("/undefined \w+ socket_create/", $e->getMessage())) {
				print "\nRuhoh! The sockets extension is not enabled!\n";
				if ($ini = php_ini_loaded_file()) {
					if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
						print "Add `extension=php_sockets.dll` to `{$ini}`";
					} else {
						print "Add `extension=php_sockets.so` to `{$ini}`\n";
						print "(or whatever is idiomatic for your install)";
					}
				} else {
					print "You are also running without a php.ini file!\n";
					print "Reinstall or reconfigure PHP with a php.ini.";
				}
				print "\nand restart run.php.\n\n";
				exit();
			} else {
				throw $e;
			}
		}
	}
}

?>
