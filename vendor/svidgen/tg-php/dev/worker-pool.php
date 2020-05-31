<?php

require(__DIR__ . '/worker.php');

class WorkerPool {

	private $running = true;
	private $idle_workers = [];
	private $active_workers = [];

	function __construct($port, $poolsize, $docroot, $router) {
		for ($i = 0; $i < $poolsize; $i++) {
			$this->idle_workers[] = new Worker(
				$this,
				(int)$port + 1 + $i,
				$docroot,
				$router
			);
		}
	}

	function has_free_workers() {
		if ($this->running && sizeof($this->idle_workers) > 0) {
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
		$this->running = false;
		$this->terminate_all($this->active_workers);
		$this->terminate_all($this->idle_workers);
	}

	function terminate_all($workers) {
		foreach ($workers as $worker) {
			$worker->terminate();
		}
	}

}

?>
