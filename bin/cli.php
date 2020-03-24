<?php

define('PKGROOT', realpath(__DIR__));
define('DOCROOT', PKGROOT);
define('LIBDIR', PKGROOT . '/lib');
define('TEMPLATE_DIR', PKGROOT . "/templates");


class CLIAdapter {

	public $configuration = array();

	private $modules = array();
	private $modulePersistence = array();

	public function output($v) {
		print_r($v);
		print "\n";
	}

	public function execute($filename) {
		$rv = $this->getModule($filename);
		if (is_object($rv)) {
			$this->output($rv);
		}
	}

	public function log($logname, $message, $debug = false) {
		if (!$debug || $this->configuration['debug']) {
			file_put_contents(
				"logs/{$logname}.log",
				date('r') . "\n". print_r($message, 1) . "\n\n",
				FILE_APPEND
			);
		}
	}

	public function configure($c) {
		foreach ($c as $k => $v) {
			$this->configuration[$k] = $v;
		}
	}

	public function provide($o, $options = array()) {
		$trace = debug_backtrace();
		$src = realpath($trace[0]['file']);
		$this->modules[$src] = $o;
		$this->modulePersistence[$src] = isset($options['persistent']) ?
			(bool)$options['persistent'] : true
		;
	}

	public function getModule($src) {
		$realsrc = realpath('./' . $src);
		include_once($realsrc);	
		$module = @$this->modules[$realsrc];
		return $module;
	}

}

$adapter = new CLIAdapter();
require_once('tg/config.php');

$adapter->execute($argv[1]);

?>
