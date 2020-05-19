<?php

class BackgroundJob {

	private $proc = null;

	function __construct($command = null) {
		$this->start($command);
	}

	function start($command = null) {
		$this->command = $this->command ?? $command;

		if (!$this->command) {
			return false;
		}

		if ($this->is_windows()) {
			$command = $this->command;
		} else {
			$command = "exec {$this->command}";
		}

		print "Starting {$command} ... \n";

		return $this->proc = proc_open(
			$command,
			[['pipe','r'], ['file','test-stdout.log','w']],
			$pipes,
			null,
			null,
			['bypass_shell' => true]
		);
	}

	function stop() {
		$status = proc_get_status($this->proc);
		$pid = $status['pid'];

		if ($this->is_windows()) {
			// `/t` - terminate and any child processes
			// `/f` - kill forceably
			exec("taskkill /pid {$pid} /f /t");
		} else {
			proc_terminate($this->proc);
		}

		proc_close($this->proc);
	}

	function is_windows() {
		return (bool)(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');
	}
}

?>
