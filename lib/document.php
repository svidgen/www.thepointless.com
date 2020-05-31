<?php

namespace TG;

require_once(__DIR__."/initializable.php");
require_once(__DIR__."/repository.php");
 
trait Document {
	use Initializable;

	private static $default_repository = null;

	public static function getRepository() {
		if (!self::$default_repository) {
			self::$default_repository = new Repository();
		}
		return self::$default_repository;
	}

	public static function getClass() {
		return get_class();
	}

	public static function get($key = 0, $options = array()) {
		return self::getRepository()->get(self::getClass(), $key, $options);
	}

	public static function getRange(
		$start, $end, $include_start = true, $include_end = true
	) {
		return self::getRepository()->getRange(
			self::getClass(), $start, $end, $include_start , $include_end
		);
	}

	public static function getOrCreate($key = 0, $options = array()) {
		return self::getRepository()->getOrCreate(
			self::getClass(),
			$key,
			$options
		);
	}

	public static function find($keySearch, $options = array()) {
		return self::getRepository()->find(
			self::getClass(),
			$keySearch,
			$options
		);
	}

	public static function getPage(
		$startingAfter,
		$direction = "asc",
		$size = 25,
		$query = null
	) {
		return self::getRepository()->getPage(
			self::getClass(),
			$startingAfter,
			$direction,
			$size,
			$query
		);
	}

	public function reload() {
		$selfFromDisk = self::getRepository()->get(
			self::getClass(),
			$this->{'$id'}
		);

		if ($selfFromDisk) {
			$this->initialize($selfFromDisk);
		}
	}

	public function save($key = null) {
		return self::getRepository()->save($this, $key);
	}

	public function delete() {
		return self::getRepository()->delete($this);
	}

	public function unserialize($str) {
		// $str = str_replace("[[NULL]]"
	}

	public function serialize($o) {
	}

	public function toArray() {
		return get_object_vars($this);
	}
}


?>
