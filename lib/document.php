<?php

namespace TG;

global $adapter;
$config = $adapter->configuration;

require_once(__DIR__."/{$config['data-adapter']}-adapter.php");
require_once(__DIR__."/initializable.php");

trait Document {
	use Initializable;

	public static function getDatabase() {
		global $adapter;
		$config = $adapter->configuration;
		$db = DB::connect($config);
		$db->debugging = $config['debug'];
		return $db;
	}

	public static function getCollectionName() {
		return get_class();
	}

	public static function get($key = 0, $options = array()) {
		$db = self::getDatabase();
		$sample = new self();

		$criteria = array(
			'collection' => self::getCollectionName(),
			'key' => (string)$key
		);

		$rows = $db->select('documents', $criteria, $options);
		if (sizeof($rows) == 1) {
			$rv = new self();
			$rv->initialize(unserialize($rows[0]['data']));
			$rv->{'$id'} = $key;
			return $rv;
		} else {
			return null;
		}
	}

	public static function getOrCreate($key = 0, $options = array()) {
		$rv = self::get($key, $options);
		if ($rv == null) {
			$rv = new self();
			$rv->save($key);
		}
		return $rv;
	}

	public static function find($keySearch, $options = array()) {
		$db = self::getDatabase();
		$sample = new self();

		$criteria = array(
			'collection' => self::getCollectionName(),
			'key like' => "%{$keySearch}%"
		);

		$rv = array();
		$rows = $db->select('documents', $criteria, $options);
		foreach ($rows as $row) {
			$rv_row = new self();
			$rv_row->initialize(unserialize($row['data']));
			$rv[] = $rv_row;
		}
		return $rv;
	}

	public static function getPage(
		$startingWith,
		$direction = "asc",
		$size = 25,
		$query = null
	) {
		$db = self::getDatabase();
		$sample = new self();

		$criteria = array(
			'collection' => self::getCollectionName(),
		);

		if ($query) {
			$criteria['key like'] = "%{$query}%";
		}

		// sanitization
		$direction = $direction == 'desc' ? $direction : 'asc';

		if ($startingWith) {
			if ($direction == "asc") {
				$criteria["key >"] = $startingWith;
			} else {
				$criteria["key <"] = $startingWith;
			}
		}

		$rv = array();
		$rows = $db->select('documents', $criteria, array(
			'order' => "`key` {$direction}",
			'limit' =>  $size
		));
		foreach ($rows as $row) {
			$rv_row = new self();
			$rv_row->initialize(unserialize($row['data']));
			$rv[] = $rv_row;
		}
		return $rv;
	}

	public function reload() {
		$selfFromDisk = self::get($this->{'$id'});
		if ($selfFromDisk) {
			$this->initialize($selfFromDisk);
		}
	}

	public function save($key = null) {
		$db = self::getDatabase();
		$collection = self::getCollectionName();
		
		$data = serialize($this);
		$row = array(
			'collection' => $collection,
			'data' => $data
		);

		if ($key) {
			$row['key'] = $key;
			$this->{'$id'} = $key;
			if (!$db->insert('documents', $row)) {
				return $this->save();
			}
			return $key;
		} else if (isset($this->{'$id'})) {
			$row['key'] = $this->{'$id'};
			if ($db->update('documents', array('key','collection'), $row)) {
				return $this->{'$id'};
			}
		} else {
			return $this->save(uniqid('', true));
		}
		
		throw new \Exception("Database error. Could not save.");
	}

	public function delete() {
		if (isset($this->{'$id'}) && $this->{'$id'}) {
			$criteria = array(
				'collection' => self::getCollectionName(),
				'key' => (string)$this->{'$id'}
			);
		} else {
			throw new \Exception("A `key` was not provided as deletion criteria."); 
		}

		$db = self::getDatabase();
		return $db->delete('documents', $criteria);
	}



	public function toArray() {
		return get_object_vars($this);
	}

	public function serialize($o) {

	}

	public function unserialize($str) {
		// $str = str_replace("[[NULL]]"
	}

}


?>
