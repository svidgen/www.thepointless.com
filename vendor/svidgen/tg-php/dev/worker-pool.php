<?php

require(__DIR__ . '/worker.php');

class WorkerPool {

	private $idle_workers = [];
	private $active_workers = [];

	function __construct($port, $poolsize = 8) {
		for ($i = 0; $i < $poolsize; $i++) {
			$this->idle_workers[] = new Worker($this, (int)$port + 1 + $i);
		}
	}

	function has_free_workers() {
		if (sizeof($this->idle_workers) > 0) {
			return true;
		}
	}

	function get_free_worker() {
		$worker = array_shift($this->idle_workers);
		array_push($this->active_workers, $worker);
		return $worker;
	}

	function release($worker) {
		$index = array_search($worker, $this->active_workers);
		if ($index > -1) {
			unset($this->active_workers[$index]);
			array_push($this->idle_workers, $worker);
		}
	}

	function terminate() {
		return;
	}

}

?>
