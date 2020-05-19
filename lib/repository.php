<?php

namespace TG;

$config = $adapter->configuration;
require_once(__DIR__."/{$config['data-adapter']}-adapter.php");

class Repository {

	private $class = null;
	private $config = null;
	private $db = null;

	function __construct($config = null) {
		global $adapter;
		$this->config = $config ?? $adapter->configuration;
	}

	public function getDatabase() {
		global $adapter;

		if (!$this->db) {
			$this->db = DB::connect($this->config);
			$this->db->debugging = $this->config['debug'];
		}

		return $this->db;
	}

	public function get($class, $key = 0, $options = []) {
		$db = $this->getDatabase();

		$criteria = [
			'collection' => $class,
			'key' => (string)$key
		];

		$rows = $db->select('documents', $criteria, $options);
		if (sizeof($rows) == 1) {
			$rv = new $class();
			$rv->initialize(unserialize($rows[0]['data']));
			$rv->{'$id'} = $key;
			return $rv;
		} else {
			return null;
		}
	}

	public function getRange(
		$class, $start, $end, $include_start = true, $include_end = true
	) {
		if ($start === null) {
			$lower = null;
			$upper = $end;
			$cmp_upper = $include_end ? '<=' : '<';
		} elseif ($end === null) {
			$upper = null;
			$lower = $start;
			$cmp_lower = $include_start ? '>=' : '>';
		} elseif ($start <= $end) {
			$lower = $start;
			$upper = $end;
			$cmp_lower = $include_start ? '>=' : '>';
			$cmp_upper = $include_end ? '<=' : '<';
		} else {
			$lower = $end;
			$upper = $start;
			$cmp_lower = $include_end ? '>=' : '>';
			$cmp_upper = $include_start ? '<=' : '<';
		}

		$criteria = [
			'collection' => $class,
		];

		if ($lower !== null) {
			$criteria["key {$cmp_lower}"] = $lower;
		}

		if ($upper !== null) {
			$criteria["key {$cmp_upper}"] = $upper;
		}

		$rv = [];
		$db = $this->getDatabase();
		$rows = $db->select('documents', $criteria);
		foreach ($rows as $row) {
			$rv_row = new $class();
			$rv_row->initialize(unserialize($row['data']));
			$rv_row->{'$id'} = $row['key'];
			$rv[] = $rv_row;
		}
		return $rv;
	}

	public function getOrCreate($class, $key = 0, $options = []) {
		$rv = $this->get($key, $options);
		if ($rv == null) {
			$rv = new $class();
			$this->save($class, $rv, $key);
		}
		return $rv;
	}

	public function find($class, $keySearch, $options = []) {
		$db = $this->getDatabase();

		$criteria = [
			'collection' => $class,
			'key like' => "%{$keySearch}%"
		];

		$rv = [];
		$rows = $db->select('documents', $criteria, $options);
		foreach ($rows as $row) {
			$rv_row = new $class();
			$rv_row->initialize(unserialize($row['data']));
			$rv[] = $rv_row;
		}
		return $rv;
	}

	public function getPage(
		$class,
		$startingAfter,
		$direction = "asc",
		$size = 25,
		$query = null
	) {
		$db = $this->getDatabase();

		$criteria = [
			'collection' => $class,
		];

		if ($query) {
			$criteria['key like'] = "%{$query}%";
		}

		// sanitization
		$direction = $direction == 'desc' ? $direction : 'asc';

		if ($startingAfter) {
			if ($direction == "asc") {
				$criteria["key >"] = $startingAfter;
			} else {
				$criteria["key <"] = $startingAfter;
			}
		}

		$rv = array();
		$rows = $db->select('documents', $criteria, array(
			'order' => "`key` {$direction}",
			'limit' =>  $size
		));
		foreach ($rows as $row) {
			$rv_row = new $class();
			$rv_row->initialize(unserialize($row['data']));
			$rv_row->{'$id'} = $row['key'];
			$rv[] = $rv_row;
		}
		return $rv;
	}

	public function save($item, $key = null, $class = null) {
		$db = $this->getDatabase();

		$class = $class ?? $item->getClass();

		$row = [
			'collection' => $class,
			'data' => serialize($item)
		];

		if ($key) {
			$row['key'] = $key;
			$item->{'$id'} = $key;
			if (!$db->insert('documents', $row)) {
				// save without explicit `key` param to treat as update.
				return $this->save($item, null, $class);
			}
			return $key;
		} else if (isset($item->{'$id'})) {
			$row['key'] = $item->{'$id'};
			if ($db->update('documents', array('key','collection'), $row)) {
				return $item->{'$id'};
			}
		} else {
			return $this->save($item, uniqid('', true), $class);
		}
		
		throw new \Exception("Database error. Could not save.");
	}

	public function delete($class, $item) {
		if (is_string($item)) {
			$criteria = [
				'collection' => $class,
				'key' => (string)$item
			];
		} else if (isset($item->{'$id'}) && $item->{'$id'}) {
			$criteria = array(
				'collection' => $class,
				'key' => (string)$this->{'$id'}
			);
		} else {
			throw new \Exception("Neither a `key` or item with a `key` was provided as deletion criteria."); 
		}

		$db = $this->getDatabase();
		return $db->delete('documents', $criteria);
	}
}

?>
