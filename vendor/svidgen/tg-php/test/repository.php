<?php

class RepoBasicDoc {
	use \TG\Document;

	function __construct($props = []) {
		$this->initialize($props);
	}
}

class RepoRangeTestDoc {
	use \TG\Document;
}

$repo = new TG\Repository();

for ($i = 1; $i < 10; $i++) {
	$key = "key-{$i}";
	$data = ['data' => "data {$i}"];
	$doc = new RepoRangeTestDoc();
	$doc->initialize($data);
	$doc->save($key);
}

function test_repo_handles_basic_docs($runner) {
	global $repo;

	$doc = new RepoBasicDoc([
		'a' => '123',
		'b' => 'xyz',
		'c' => true,
		'd' => false,
		'e' => null,
		'f' => 12,
		'g' => 1.2,
	]);

	$id = $repo->save($doc);
	$test = $repo->get(RepoBasicDoc::getClass(), $id);

	$runner->assert($test->a === '123');  // sanity test
	$runner->assert_json_equal($doc, $test);
}

function test_repo_can_save_docs_with_a_key($runner) {
	global $repo;

	$doc = new RepoBasicDoc([
		'whatever' => 'whatever else'
	]);

	$repo->save($doc, 'somekey');
	$test = $repo->get(RepoBasicDoc::getClass(), 'somekey');

	$runner->assert_json_equal($doc, $test);
}

function test_repo_returns_null_when_key_is_absent($runner) {
	global $repo;

	$doc = new RepoBasicDoc([
		'whatever' => 'you know. stuff'
	]);

	$repo->save($doc, 'key-a');
	$test = $repo->get(RepoBasicDoc::getClass(), 'NOT-key-a');

	$runner->assert_strictly_equal($test, null);
}

function test_repo_retrieves_gte_keys($runner) {
	global $repo;
	
	// RepoRangeTestDoc collection is initialized above.
	$test = $repo->getRange(
		RepoRangeTestDoc::getClass(),
		$start = 'key-6',
		$end = null,
		$include_start = true
	);

	$runner->assert_equal(sizeof($test), 4);
}

function test_repo_retrieves_lte_keys($runner) {
	global $repo;

	// RepoRangeTestDoc collection is initialized above.

	$test = $repo->getRange(
		RepoRangeTestDoc::getClass(),
		$start = null,
		$end = 'key-5',
		$include_start = true, // or false, shouldn't matter.
		$include_end = true
	);

	$runner->assert_equal(sizeof($test), 5);
}

function test_repo_retrieves_gt_keys($runner) {
	global $repo;

	// RepoRangeTestDoc collection is initialized above.

	$test = $repo->getRange(
		RepoRangeTestDoc::getClass(),
		$start = 'key-6',
		$end = null,
		$include_start = false,
		$include_end = false
	);

	$runner->assert_equal(sizeof($test), 3);
}

function test_repo_retrieves_lt_keys($runner) {
	global $repo;

	// RepoRangeTestDoc collection is initialized above.

	$test = $repo->getRange(
		RepoRangeTestDoc::getClass(),
		$start = null,
		$end = 'key-5',
		$include_start = false,
		$include_end = false
	);

	$runner->assert_equal(sizeof($test), 4);
}

function test_repo_retrieves_ranges_inclusively($runner) {
	global $repo;

	// RepoRangeTestDoc collection is initialized above.

	$test = $repo->getRange(
		RepoRangeTestDoc::getClass(),
		$start = 'key-2',
		$end = 'key-6'
	);

	$runner->assert_equal(sizeof($test), 5);
}

function test_repo_retrieves_ranges_exclusively($runner) {
	global $repo;

	// RepoRangeTestDoc collection is initialized above.

	$test = $repo->getRange(
		RepoRangeTestDoc::getClass(),
		$start = 'key-2',
		$end = 'key-6',
		$include_start = false,
		$include_end = false
	);

	$runner->assert_equal(sizeof($test), 3);
}

function test_repo_retrieves_pages($runner) {
	global $repo;

	// RepoRangeTestDoc collection is initialized above.

	$test = $repo->getPage(
		RepoRangeTestDoc::getClass(),
		$startingAfter = 'key-2',
		$direction = 'asc',
		$size = '5'
	);

	$runner->assert_equal(sizeof($test), 5);
	$runner->assert_equal($test[0]->data, 'data 3');
	$runner->assert_equal($test[4]->data, 'data 7');
}

?>
