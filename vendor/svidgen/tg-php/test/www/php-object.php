<?php

namespace TGT;

class PhpObject {
	public $id = 'some-id';
	public $rando_attribute = 'some-attribute-value';
	private $private_attribute = 'private-value';

	public function dotCat($a, $b) {
		return "{$a}.{$b}";
	}
}

global $adapter;
$adapter->provide(new PhpObject(), ['persistent' => false]);

?>
