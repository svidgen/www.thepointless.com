<?php

namespace TG;

require_once(__DIR__.'./config.php');

trait ActiveRecord {

	public static function getDatabase() {
		global $adapter;
		$config = $adapter->configuration;

		$db = DB::connect(
			$config['host'],
			$config['user'],
			$config['pass'],
			$config['database']
		);
		$db->debugging = $config['debug'];
		return $db;
	}

	public static function getCollectionName() {
		return get_class();
	}

	public static function getPrimaryKeyName() {
		return get_class() . "Id";
	}

	public static function get($criteria = array(), $options = array()) {
		$db = self::getDatabase();
		$sample = new self();
		$fields = array_keys($sample->toArray());
		$filtered_criteria = $db->filterFields($criteria, $fields);

		$rows = $db->select(
			self::getCollectionName(),
			$filtered_criteria,
			$options
		);

		$rv = array();
		foreach ($rows as $row) {
			$rvRow = new self();
			$rvRow->initialize($row);
			$rv[] = $rvRow;
		}
		return $rv;
	}

	public function save() {
		$db = self::getDatabase();
		$name = self::getCollectionName();
		$pk = self::getPrimaryKeyName();
		$row = $this->toArray();

		unset($row[$pk]);
		if (!$this->{$pk}) {
			$id = $db->insert($name, $row);
			$this->{$pk} = $id;
			return $id;
		} else {
			return $db->update($name, $pk, $row);
		}
	}

	public function delete() {
		$db = self::getDatabase();
		return $db->delete(self::getCollectionName(), $this);
	}

	public function initialize($values = array()) {
		$values = (object)$values;
		foreach ($this as $k => $v) {
			if (isset($values->{$k})) {
				$this->{$k} = $values->{$k};
			}
		}
	}

	public function toArray() {
		return get_object_vars($this);
	}

	public function toDTO() {
		return (object)$this->toArray();
	}

}


?>
