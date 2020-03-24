<?php

namespace TG;

class SafeString {
	private $data;

	function __construct($s) {
		$this->data = $s;
	} // __construct()

	function __toString() {
		return (string)$this->data;
	} // __toString()

} // class SafeString


class SafeLiteral extends SafeString {
} // class SafeLiteral

?>
