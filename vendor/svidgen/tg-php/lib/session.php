<?php

namespace TG;

require_once(__DIR__.'/document.php');

class Session {

	use \TG\Document {
		\TG\Document::save as __save;
	}

	public $modified;
	public $data;

	public function __construct() {
		$modified = date('r', time());
	}

}

?>
