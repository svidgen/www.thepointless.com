<?php

function test_passes($runner) {
	$runner->assert(true);
}

function test_fails($runner) {
	$runner->assert(false);
}

function test_whatever($runner, $value) {
	$runner->assert($value);
}

$runner->provide_cases('test_whatever', [
	[true],
	[false],
	['banana'],
	['']
]);

?>
