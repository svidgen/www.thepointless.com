<?php

namespace TG;

require_once('db-safe-string.php');

define("SQLITE_ADAPTER_NULL", "NULL-8f6d7006-9d3e-4d68-bf38-3cc99c160080");

class DB {

	private static $connections;

	private $db = null;

	private $request_query_count = 0;
	private $request_query_time = 0;
	private $transaction_depth = 0;


	protected function __construct($database) {
		global $adapter;
		$adapter->log('tracing', "Creating new SQLite adapter for `{$database}`.");
		if ($db = new \SQLite3(DOCROOT."/data/{$database}.db")) {
			$db->busyTimeout(30000);
			$this->db = $db;
		}
	} // __construct()


	public static function connect($config) {
		global $adapter;
		$database = $config['database'];
		$connection_key = "{$database}";
		if (!isset(self::$connections[$connection_key])) {
			$log_message = "No SQLite adapter exists for `{$database}`.";
			$adapter->log('tracing', $log_message);
			self::$connections[$connection_key] = new self($database);
		} else {
			$log_message = "Using existing SQLite adapter for `{$database}`.";
			$adapter->log('tracing', $log_message);
		}
		return self::$connections[$connection_key];
	} // connect()


	function sanitize($v) {
		if (is_array($v)) {
			$rv = array();
			foreach ($v as $k => $v2) {
				$rv[$this->sanitize($k)] = $this->sanitize($v2);
			}
			return $rv;
		} elseif ($v instanceof SafeString || $v instanceof SafeLiteral || $v === null) {
			return $v;
		} else {
			return $this->db->escapeString(str_replace("\0", SQLITE_ADAPTER_NULL, $v));
		}
	} // sanitize()


	function normalize($s) {
		$rv = trim($s);
		$rv = preg_replace('/[ \t]+/', ' ', $rv);
		return $rv;
	} // normalize()


	public function filterFields($row, $valid_fields, $prepend = '') {
		$rv = array();
		$comparisons = array('', '>', '>=', '<', '<=', '!=', '<>');
		if ($prepend) { $prepend = $prepend . '.'; }
		foreach ($valid_fields as $k) {
			foreach ($comparisons as $c) {
				$kk = $k . $c;
				if (isset($row[$kk])) {
					$rv[$prepend . $kk] = $row[$kk];
				}
			}
		}
		return $rv;
	} // filterfields()


	public function query($query) {
		global $adapter;

		$query = str_replace("\t", " ", $query);

		$start = microtime(true);
		$result = $this->db->query($query);
		$end = microtime(true);
		$elapsed = $end - $start;

		$this->request_query_count += 1;
		$this->request_query_time += $elapsed;

		$log_entry = "{$query}\n{$elapsed}";
		$adapter->log('query', $log_entry, (bool)($elapsed > 0.15));

		return $result;

	} // query()


	public function getAffectedRows() {
		return $this->db->changes();
	} // getAffectedRows()


	private function where($o, $glue = 'and') {
		$o = $this->sanitize($o);
		if (is_array($o)) {
			$matches = array();
			foreach ($o as $k => $v) {
				if (is_array($v)) {
					foreach ($v as &$subv) {
						if ($subv instanceof SafeLiteral) {
							$subv = "{$subv}";
						} else {
							$subv = "'{$subv}'";
						}
					}
					$v_string = join(',', $v);
					$matches[] = "`{$k}` in ({$v_string})";
				} else {
					if (preg_match("/^([^\s]+)\s*(=|<|>|>=|<=|<>|<=>|!=|\slike)\s*$/", $k, $m)) {
						$kv = "`{$m[1]}` {$m[2]} ";
					} elseif (is_int($k)) {
						$kv = '';
					} else {
						$kv = "`{$k}` =";
					}

					if ($v instanceof SafeLiteral) {
						$vv = $v;
					} elseif ($v === null) {
						$kv = $k;
						$vv = " is null";
					} else {
						$vv = "'{$v}'";
					}
					$matches[] = "{$kv}{$vv}";
				}
			}
			
			if (sizeof($matches) > 0) {
				$where_clause = "(" . join(" {$glue} ", $matches) . ")";
			} else {
				$where_clause = '';
			}

			return new SafeLiteral($where_clause);
		} else {
			throw new \Exception("\$o must be an array containing key/value pairs to SELECT on.");
		}
	} // where()
 

	private function setClause($o) {
		$o = $this->sanitize($o);
		$sets = array();
		foreach ($o as $k => $v) {
			if (is_object($v) || is_array($v)) {
				// non-scalar: omit.
			} else if ($v instanceof SafeLiteral) {
				$sets[$k] = "`{$k}`={$v}";
			} else {
				$sets[$k] = "`{$k}`='{$v}'";
			}
		}
		$sets = join(", ", $sets);
		return $sets;
	} // my_set()


	public function getLastError() {
		return $this->db->lastErrorMsg();
	} // my_error()


	public function fetchAssoc($result) {
		$row = $result->fetchArray(SQLITE3_ASSOC);
		if ($row == null) return null;
		foreach ($row as $k => $v) {
			$row[$k] = str_replace(SQLITE_ADAPTER_NULL, "\0", $v);
		}
		return $row;
	} // my_fetch_assoc()


	public function getInsertId() {
		return $this->db->lastInsertRowID();
	} // getInsertId()


	public function startTransaction() {
		$rv = $this->query("savepoint p{$this->transaction_depth}");

		if ($rv) {
			$this->transaction_depth++;
		}

		return $rv;
	} // startTransaction()


	public function begin() {
		return $this->startTransaction();
	} // begin()


	public function commit() {
		$this->transaction_depth--;
		if ($this->transaction_depth <= 0) {
			$this->transaction_depth = 0;
		}
		return $this->query("relase p{$this->transaction_depth}");
	} // my_commit()


	public function rollback() {
		$this->transaction_depth--;
		if ($this->transaction_depth <= 0) {
			$this->transaction_depth = 0;
		}
		return $this->query("rollback to p{$this->transaction_depth}");
	} // my_rollback()


	public function select($table, $o, $options = array()) {
		$table = $table; // sanitize($table);
		
		$where_clause = $this->where($o);
		if (strlen(trim($where_clause)) > 0) {
			$where_clause = " where {$where_clause} ";
		}

		$fields_clause = $this->buildFieldsClauseFrom($options);

		$clauses = array(
			'select',
			$fields_clause,
			'from',
			$table,
			$where_clause,
			$this->buildOrderClauseFrom($options),
			$this->buildGroupClauseFrom($options),
			$this->buildLimitClauseFrom($options),
		);

		$query = join(' ', $clauses);

		if (isset($options['sql']) && $options['sql']) {
			return $query;
		}

		if ($result = $this->query($query)) {
			$rv = array();
			while ($row = $this->fetchAssoc($result)) {
				$rv[] = $row;
			}
			return $rv;
		} else {
			throw new \Exception(
				"Query failed: "
				. $this->getLastError() . 
				"\nQuery: " . $query
			);
		}
	} // select()


	private function buildLimitClauseFrom($options) {
		$rv = '';
		if (isset($options['limit'])) {
			$l = $options['limit'];
			if (isset($l['count'])) {
				$rv = 'limit ';
				if (isset($l['offset'])) {
					$rv .= (int)$l['offset'] . ',';
				}
				$rv .= (int)$l['count'];
			} elseif (is_numeric($l)) {
				$rv = 'limit ' . (int)$l;
			}
		}
		return $rv;
	} // buildLimitClauseFrom()


	private function buildOrderClauseFrom($options) {
		$rv = '';
		if (isset($options['order'])) {
			$rv = 'order by ' . $options['order'];
		}
		return $rv;
	} // buildOrdreClauseFrom()

	private function buildFieldsClauseFrom($options) {
		// select ALL if no fields are provided.
		$rv = '*';
		
		if (isset($options['fields']) && !isset($options['columns'])) {
			$options['columns'] = $options['fields'];
		}

		if (isset($options['columns'])) {
			if (is_array($options['columns'])) {
				$rv = join(',', $options['columns']);
			} else {
				$rv = $options['columns'];
			}
		}

		return $rv;
	} // buildFieldsClauseFrom()

	private function buildGroupClauseFrom($options) {
		$rv = '';
		if (isset($options['group'])) {
			if (is_array($options['group'])) {
				$rv = 'group by ' . join(',', $options['group']);
			} else {
				$rv = 'group by ' . $options['group'];
			}
		}
		return $rv;
	} // buildGroupClauseFrom()

	public function insert($table, $o) {
		if (isset($o) && is_array($o)) {
			if (sizeof($o) == 0) {
				return true;
			}

			$table = $this->sanitize($table);

			$fields = array();
			$values = array();
			foreach ($o as $k => $v) {
				$fields[] = '`' . $this->sanitize($k) . '`';
				if ($v instanceof SafeLiteral) {
					$values[] = $v;
				} else { 
					$values[] = "'" . $this->sanitize($v) . "'";
				}
			}

			$fields = join(',', $fields);
			$values = join(',', $values);

			$query = "insert into {$table} ({$fields}) values ({$values})";
			$result = @$this->query($query);
			if ($result) {
				return $this->getInsertId();
			} else {
				return false;
			}
		} else {
			throw new \Exception("\$o must be an array containing key/value pairs to INSERT.");
		}
	} // insert()


	public function update($table, $keys, $o) {
		if (isset($o) && is_array($o)) {
			if (sizeof($o) == 0) {
				return false;
			}

			if (is_array($keys)) {
				if (sizeof($keys) == 0) {
					return false;
				}
				$wheres = array();
				foreach ($keys as $key) {
					$wheres[$key] = $o[$key];
					unset($o[$key]);
				}
			} else {
				if (!$keys || !$o[$keys]) {
					return false;
				}
				$wheres = array($keys => $o[$keys]);
				unset($o[$keys]);
 			}
			$where = $this->where($wheres);

			$table = $this->sanitize($table);
			$sets = $this->setClause($o);
			
			$query = "update {$table} set {$sets} where {$where}";
			if ($result = $this->query($query)) {
				return $result;
			} else {
				return false;
			}
		} else {
			throw new \Exception("\$o must be an array containing key/value pairs to UPDATE.");
		}
	} // update()


	public function delete($table, $where, $delete_all = false) {
		$table = $this->sanitize($table);
		$where_clause = $this->where($where);
		if (strlen(trim($where_clause)) > 0) {
			$where_clause = " where {$where_clause} ";
		}

		if (strlen($where_clause) == 0 && !$delete_all) {
			throw new \Exception("No where conditions provided to my_delete(). Set 3rd parameter to TRUE to delete ALL ROWS from a table.");
		}

		$query = "delete from {$table} {$where_clause}";
		if ($result = $this->query($query)) {
			return $this->getAffectedRows();
		} else {
			throw new \Exception("Query failed: " . my_error());
		}
	} // delete()

}

?>
