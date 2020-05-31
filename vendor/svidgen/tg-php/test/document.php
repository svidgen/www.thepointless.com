<?php

class BasicDoc {
	use \TG\Document;

	function __construct($props = []) {
		$this->initialize($props);
	}
}

class RangeTestDoc {
	use \TG\Document;
}

for ($i = 1; $i < 10; $i++) {
	$key = "key-{$i}";
	$data = ['data' => "data {$i}"];
	$doc = new RangeTestDoc();
	$doc->initialize($data);
	$doc->save($key);
}

function test_docstore_handles_basic_docs($runner) {
	$doc = new BasicDoc([
		'a' => '123',
		'b' => 'xyz',
		'c' => true,
		'd' => false,
		'e' => null,
		'f' => 12,
		'g' => 1.2,
	]);

	$id = $doc->save();
	$test = BasicDoc::get($id);

	$runner->assert($test->a === '123');  // sanity test
	$runner->assert_json_equal($doc, $test);
}

function test_docstore_can_save_docs_with_a_key($runner) {
	$doc = new BasicDoc([
		'whatever' => 'whatever else'
	]);

	$doc->save('somekey');
	$test = BasicDoc::get('somekey');

	$runner->assert_json_equal($doc, $test);
}

function test_docstore_returns_null_when_key_is_absent($runner) {
	$doc = new BasicDoc([
		'whatever' => 'you know. stuff'
	]);

	$doc->save('key-a');
	$test = BasicDoc::get('NOT-key-a');

	$runner->assert_strictly_equal($test, null);
}

function test_docstore_retrieves_gte_keys($runner) {
	// RangeTestDoc collection is initialized above.

	$test = RangeTestDoc::getRange(
		$start = 'key-6',
		$end = null,
		$include_start = true
	);

	$runner->assert_equal(sizeof($test), 4);
}

function test_docstore_retrieves_lte_keys($runner) {
	// RangeTestDoc collection is initialized above.

	$test = RangeTestDoc::getRange(
		$start = null,
		$end = 'key-5',
		$include_start = true, // or false, shouldn't matter.
		$include_end = true
	);

	$runner->assert_equal(sizeof($test), 5);
}

function test_docstore_retrieves_gt_keys($runner) {
	// RangeTestDoc collection is initialized above.

	$test = RangeTestDoc::getRange(
		$start = 'key-6',
		$end = null,
		$include_start = false,
		$include_end = false
	);

	$runner->assert_equal(sizeof($test), 3);
}

function test_docstore_retrieves_lt_keys($runner) {
	// RangeTestDoc collection is initialized above.

	$test = RangeTestDoc::getRange(
		$start = null,
		$end = 'key-5',
		$include_start = false,
		$include_end = false
	);

	$runner->assert_equal(sizeof($test), 4);
}

function test_docstore_retrieves_ranges_inclusively($runner) {
	// RangeTestDoc collection is initialized above.

	$test = RangeTestDoc::getRange(
		$start = 'key-2',
		$end = 'key-6'
	);

	$runner->assert_equal(sizeof($test), 5);
}

function test_docstore_retrieves_ranges_exclusively($runner) {
	// RangeTestDoc collection is initialized above.

	$test = RangeTestDoc::getRange(
		$start = 'key-2',
		$end = 'key-6',
		$include_start = false,
		$include_end = false
	);

	$runner->assert_equal(sizeof($test), 3);
}

function test_docstore_retrieves_pages($runner) {
	// RangeTestDoc collection is initialized above.

	$test = RangeTestDoc::getPage(
		$startingAfter = 'key-2',
		$direction = 'asc',
		$size = '5'
	);

	$runner->assert_equal(sizeof($test), 5);
	$runner->assert_equal($test[0]->data, 'data 3');
	$runner->assert_equal($test[4]->data, 'data 7');
}

?>
