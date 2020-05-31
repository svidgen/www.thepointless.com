<?php

define('DOCROOT', '.');
define('PKGROOT', realpath(__DIR__ . '/..'));
define('LIBDIR', PKGROOT . '/lib');
define('TEMPLATE_DIR', PKGROOT . "/templates");

define('BEGIN_COLOR_DEF', "\033[");
define('END_COLOR_DEF', "m");
define('END_COLOR_STR', "\033[0m");


class TestAdapter {

	public $configuration = array();
	private $tests = [];
	private $cases = [];
	private $fails = [];
	private $passes = [];
	private $current_test = null;
	private $test_output = [];
	private $start_time = null;

	private $colors = [
		'red' => '0;31',
		'green' => '0;32',
		'blue' => '0;34',
		'normal' => '0;39',
		'gray' => '1;30',
		'black' => '0;30',
		'light_gray' => '0;37',
	];

	function __construct() {
		$this->start_time = microtime(1);
		$this->configuration = [
			'data-adapter' => 'sqlite',
			'database' => 'test-database',
			'debug' => false
		];
		$db_file = "data/{$this->configuration['database']}.db";
		@unlink($db_file);
		@mkdir('data');
		$db = new SQLite3($db_file);
		$db->exec(file_get_contents(__DIR__ . '/../lib/documents.sqlite.sql'));
		$db->close();
	}

	public function configure($config) {
		foreach ($config as $k => $v) {
			$this->configuration[$k] = $v;
		}
	}

	public function assert($value, $message = null) {
		if (!$value) {
			$full_message = "`{$value}` is not truthy.\n{$message}";
			throw new \Exception($full_message);
		}
	}

	public function assert_equal($left, $right, $message = null) {
		if ($left != $right) {
			$full_message = "`{$left}` != `{$right}`\n{$message}";
			throw new \Exception($full_message);
		}
	}

	public function assert_strictly_equal($left, $right, $message = null) {
		if ($left !== $right) {
			$full_message = "`{$left}` != `{$right}`\n{$message}";
			throw new \Exception($full_message);
		}
	}

	public function assert_json_equal($left, $right, $message = null) {
		$left_json = json_encode($left);
		$right_json = json_encode($right);
		if ($left_json != $right_json) {
			$full_message = "`{$left_json}` !== `{$right_json}`\n{$message}";
			throw new \Exception($full_message);
		}
	}

	public function assert_contains($haystack, $needle) {
		if (!strstr($haystack, $needle)) {
			$full_message = "`{$needle}` not in `{$haystack}`";
			throw new \Exception($full_message);
		}
	}

	public function assert_not_contains($haystack, $needle) {
		if (strstr($haystack, $needle)) {
			$full_message = "`{$needle}` is in `{$haystack}`";
			throw new \Exception($full_message);
		}
	}

	public function log($logname, $message, $debug = false) {
		$log_line = "{$logname}: {$message}";
		if ($debug || @$this->configuration['debug']) {
			print "{$log_line}\n";
		} elseif ($this->current_test) {
			if (!$this->test_output[$this->current_test]) {
				$this->test_output[$this->current_test] = [];
			}
			$this->test_output[$this->current_test][] = $log_line;
		}
	}

	public function provide_cases($test_name, $cases) {
		$this->cases[$test_name] = $cases;
	}

	public function run_test($test_name) {
		if (isset($this->cases[$test_name])) {
			$cases = $this->cases[$test_name];
		} else {
			$cases = [[]];
		}

		foreach ($cases as $k => &$v) {
			array_unshift($v, $this);
		}

		foreach ($cases as $test_case) {
			try {
				call_user_func_array($test_name, $test_case);
				$this->register_success($test_name, $test_case);
			} catch (\Exception $e) {
				$this->register_failure($test_name, $test_case, $e);
			} catch (\Error $e) {
				$this->register_failure($test_name, $test_case, $e);
			}
		}
	}

	private function full_name($name, $case) {
		// remove `$this` from the test case
		array_shift($case);

		$arg_strings = [];
		foreach ($case as $arg) {
			// will eventually need to do some conversiony stuff here.
			$arg_strings[] = @(string)$arg;
		}

		return $name . '(' . join(',', $arg_strings) . ')';
	}

	private function register_success($name, $case) {
		$fullname = $this->full_name($name, $case);
		$this->passes[] = $fullname;
		print $this->colorize('green', "{$fullname} PASSED.\n");
	}

	private function register_failure($name, $case, $e) {
		$fullname = $this->full_name($name, $case);
		$this->fails[] = $fullname;
		print "\n";
		print $this->colorize('red', "{$fullname} FAILED.\n");
		print $e;
		print "\n\n";
	}

	private function colorize($color, $text) {
		$color_start = BEGIN_COLOR_DEF . $this->colors[$color] . END_COLOR_DEF;
		$color_end = END_COLOR_STR;
		return $color_start . $text . $color_end;
	}

	private function discover_tests() {
		return $this->discover_functions('/^test_/');
	}

	private function discover_cleanups() {
		return $this->discover_functions('/^cleanup_/');
	}

	private function discover_functions($pattern) {
		$functions = get_defined_functions();
		$user_functions = $functions['user'];
		$rv = [];
		foreach ($user_functions as $name) {
			if (preg_match($pattern, $name)) {
				print $this->colorize('blue', "Discovered {$name} ...\n");
				$rv[] = $name;
			}
		}
		return $rv;
	}

	private function run_all_tests($dryrun) {
		$tests = $this->discover_tests();
		print "\n";

		if ($dryrun) {
			return;
		}

		foreach ($tests as $test) {
			$this->run_test($test);
		}
		print "\n";
	}

	private function cleanup() {
		$cleanups = $this->discover_cleanups();
		foreach ($cleanups as $cleanup) {
			$cleanup($this);
		}
	}

	private function summarize() {
		$this->end_time = microtime(1);
		$runtime = $this->end_time - $this->start_time;
		$runtime_string = sprintf('%.2f seconds', $runtime);

		$failed_count = sizeof($this->fails);
		$passed_count = sizeof($this->passes);

		$failed_text = $this->colorize('red', "Failed: {$failed_count}");
		$passed_text = $this->colorize('green', "Passed: {$passed_count}");

		print "{$failed_text} - {$passed_text} - {$runtime_string}\n\n";

		if ($failed_count > 0) {
			print $this->colorize('red', 'Tests failed.');
		} else {
			print $this->colorize('green', 'All tests passed.');
		}
	}

	public function has_failures() {
		return (bool)(sizeof($this->fails) > 0);
	}

	public function execute($dryrun) {
		$this->run_all_tests($dryrun);
		$this->cleanup();

		if ($dryrun) { return; }

		$this->summarize();
		print "\n\n";
		exit($this->has_failures() ? 1 : 0);
	}

}

$oldpath = get_include_path();
set_include_path(join([
	__DIR__,
	DOCROOT,
	PKGROOT,
	LIBDIR,
	TEMPLATE_DIR,
	$oldpath
], PATH_SEPARATOR));

$adapter = new TestAdapter();
$runner = $adapter;
require_once('document.php');

$index = $argv[1];
$dryrun = false;

if (!file_exists($index)) {
	print "You must provide an index script!\n\n";
	exit(1);
}

require_once($index);

$adapter->execute($dryrun);
if ((!$dryrun) && $adapter->has_failures()) {
	exit(1);
}

?>
