<?php

namespace TG;

require_once('db-safe-string.php');

class DB {

	private static $connections;

	private $db = null;

	private $request_query_count = 0;
	private $request_query_time = 0;
	private $query_debug_log = "logs/query.log";
	private $transaction_depth = 0;
	public $debugging = false;


	protected function __construct($host, $user, $pass, $database) {
		if ($db = mysqli_connect($host, $user, $pass, $database)) {
			// mysqli_select_db($db, $database);
			mysqli_set_charset($db, 'utf8');
			$this->db = $db;
		}
	} // __construct()


	public static function connect($config) {
		$host = $config['host'];
		$user = $config['user'];
		$pass = $config['pass'];
		$database = $config['database'];
		$connection_key = "{$user}|{$host}|{$database}";
		if (!isset(self::$connections[$connection_key])) {
			self::$connections[$connection_key] = new self(
				$host, $user, $pass, $database
			);
		}
		return self::$connections[$connection_key];
	} // connect()


	function sanitize($v) {
		if (is_array($v)) {
			$rv = array();
			foreach ($v as $k => $v2) {
				// $v[$k] = sanitize($v2);
				$rv[$this->sanitize($k)] = $this->sanitize($v2);
			}
			return $rv;
		} elseif ($v instanceof SafeString || $v instanceof SafeLiteral || $v === null) {
			return $v;
		} else {
			return mysqli_real_escape_string($this->db, $v);
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
		$query = str_replace("\t", " ", $query);

		$missing_index = false;
		if ($this->debugging) {
			if ($result = mysqli_query($this->db, "explain {$query}")) {
				while ($row = $this->fetchAssoc($result)) {
					if ($row['Extra'] != 'Select tables optimized away') {
						if (
							$row['Extra'] == 'Using filesort'
							|| $row['Extra'] == 'Using temporary'
							|| $row['key'] == ''
							|| $row['rows'] > 2500
						) {
							$missing_index = true;
						}
					}
				}
			}
		}

		$start = microtime(true);
		$result = mysqli_query($this->db, $query);
		$end = microtime(true);
		$elapsed = $end - $start;

		$this->request_query_count += 1;
		$this->request_query_time += $elapsed;

		if ($this->debugging || $missing_index || $elapsed > 0.15) {
			$fd = "{$query}\n{$elapsed}\n\n";
			file_put_contents($this->query_debug_log, $fd, FILE_APPEND);
		}

		return $result;

	} // query()


	public function getAffectedRows() {
		return mysqli_affected_rows($this->db);
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
						$kv = "`{$k}`=";
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
		return mysqli_error($this->db);
	} // my_error()


	public function fetchAssoc($result) {
		return mysqli_fetch_assoc($result);
	} // my_fetch_assoc()


	public function getInsertId() {
		return mysqli_insert_id($this->db);
	} // getInsertId()


	public function startTransaction() {
		if ($this->transaction_depth == 0) {
			$rv = $this->query("start transaction");
		} else {
			$rv = $this->query("savepoint p{$this->transaction_depth}");
		}

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
			return $this->query("commit");
		} else {
			return true;
		}
	} // my_commit()


	public function rollback() {
		$this->transaction_depth--;
		if ($this->transaction_depth <= 0) {
			$this->transaction_depth = 0;
			return $this->query("rollback");
		} else {
			return $this->query("rollback to p{$this->transaction_depth}");
		}
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
			$this->buildLimitClauseFrom($options),
			$this->buildGroupClauseFrom($options)
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
			$sets = $this->setClause($o);

			$query = "insert into {$table} set {$sets}";
			if ($result = $this->query($query)) {
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
