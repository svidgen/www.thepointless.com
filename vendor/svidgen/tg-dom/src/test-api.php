<?php

namespace TG;

class TestAPI {

	public function returnNothing() { }
	public function returnTrue() { return true; }
	public function returnFalse() { return false; }
	public function returnNull() { return null; }
	public function returnOne() { return 1; }
	public function returnTwo() { return 2; }
	public function returnZero() { return 0; }
	public function returnString() { return "value"; }
	public function returnObject() { return (object)array('a' => 1); }
	public function echoArg($o) { return $o; }
	public function getInvocable() { return new Invocable(); }
}

class Invocable {
	public function invoke() { return 'monkey farts'; }
}

global $adapter;
$adapter->provide(new TestAPI());

?>
