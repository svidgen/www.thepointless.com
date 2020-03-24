<?php

namespace TG;

class Repository {

	public $name;
	public $PK;
	public $database;

	public function __construct($name, $PK) {
		$this->name = $name;
		$this->PK = $PK;
	}

	public function filterFields($fields, $filter) {
		$db = new \DB;
		return $db->filterFields($fields, $filter);
	}

	public function select($criteria, $options) {
		$db = new \DB;
	}
	
}

?>
