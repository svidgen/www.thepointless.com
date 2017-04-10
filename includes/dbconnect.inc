<?php


	$request_query_count = 0;
	$request_query_time = 0;
	$query_debug_log = "logs/query.log";

	// DAL specific configuration values
	$proverbs_page_size = 5;


	$transaction_depth = 0;


	$db = my_connect($db_default_host, $db_default_user, $db_default_pass, $db_default_db);


	function sanitize($v) {
		global $db;
		if (is_array($v)) {
			$rv = array();
			foreach ($v as $k => $v2) {
				// $v[$k] = sanitize($v2);
				$rv[sanitize($k)] = sanitize($v2);
			}
			return $rv;
		} elseif ($v instanceof SafeString || $v instanceof SafeLiteral || $v === null) {
			return $v;
		} else {
			return mysqli_real_escape_string($db, $v);
		}
	} // sanitize()


	function normalize($s) {
		$rv = trim($s);
		$rv = preg_replace('/[ \t]+/', ' ', $rv);
		return $rv;
	} // normalize()


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


	function safe_string($s) {
		return new SafeString($s);
	} // safe_string()


	function safe_literal($s) {
		return new SafeLiteral($s);
	} 

	function filtered_row($row, $valid_fields, $prepend = '') {
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
	} // filtered_row()


	function either($arr, $a, $b) {
		return anyof($arr, array($a, $b));
	} // either()


	function anyof($arr, $keys) {
		foreach ($keys as $key) {
			if (isset($arr[$key])) {
				return $arr[$key];
			}
		}
		return false;
	} // anyof()


	function prefix_keys($in_array, $prefix) {
		$rv = array();
		foreach ($in_array as $k => $v) {
			if (strpos($k, $prefix) === 0) {
				$rv[$k] = $v;
			} else {
				$rv[$prefix . $k] = $v;
			}
		}
		return $rv;
	} // prefix_keys()


	function my_connect($host, $user, $pass, $database) {
		if ($db = mysqli_connect($host, $user, $pass)) {
			mysqli_select_db($db, $database);
			mysqli_set_charset($db, 'utf8');
			return $db;
		} else {
			return false;
		}
	} // my_connect()


	function my_query($query, $database = false) {
		global $debug_mode, $query_debug_log, $db, $request_query_count, $request_query_time;

		if (!$database) {
			$database = $db;
		}

		$query = str_replace("\t", " ", $query);

		$missing_index = false;
		if ($debug_mode) {
			if ($result = mysqli_query($database, "explain {$query}")) {
				while ($row = mysqli_fetch_assoc($result)) {
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
		$result = mysqli_query($database, $query);
		$end = microtime(true);
		$elapsed = $end - $start;

		$request_query_count += 1;
		$request_query_time += $elapsed;

		if ($missing_index || $elapsed > 0.15) {
			$fd = "{$query}\n{$elapsed}\n\n";
			file_put_contents($query_debug_log, $fd, FILE_APPEND);
		}

		return $result;

	} // my_query()


	function my_affected_rows($database = false) {
		global $db;
		if ($database) {
			$database = $db;
		}
		return mysqli_affected_rows($database);
	} // my_affected_rows()


	function my_where($o, $glue = 'and') {
		$o = sanitize($o);
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
					$matches[] = "{$k} in ({$v_string})";
				} else {
					if (preg_match("/(=|<|>|>=|<=|<>|<=>|!=|like)\s*$/", $k)) {
						$kv = $k;
					} elseif (is_int($k)) {
						$kv = '';
					} else {
						$kv = "{$k}=";
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
				// $where_clause = 'where ' . join(" {$glue} ", $matches);
				$where_clause = "(" . join(" {$glue} ", $matches) . ")";
			} else {
				$where_clause = '';
			}

			return new SafeLiteral($where_clause);
		} else {
			throw new Exception("\$o must be an array containing key/value pairs to SELECT on.");
		}
	} // my_where()
 

	function my_set($o) {
		$o = sanitize($o);
		foreach ($o as $k => $v) {
			if ($v instanceof SafeLiteral) {
				$o[$k] = "{$k}={$v}";
			} else {
				$o[$k] = "{$k}='{$v}'";
			}
		}
		$sets = join(", ", $o);
		return $sets;
	} // my_set()


	function my_limit($p) {
		$pagesize = (int)$p['pagesize'];
		$pagesize = max(1, $pagesize);
		$pagesize = min(100, $pagesize);

		$page = (int)$p['page'];
		$page--;
		$page = max(0, $page);
		$page = min(100, $page);

		$start = $page * $pagesize;

		$order = sanitize($p['order']);

		return "order by {$order} limit {$start}, {$pagesize}";
	} // my_page()


	function sort_selector($options, $parameter = 'sort', $selected = false) {
		// if GET[query_parameter] is not set, the FIRST sort option
		// is "selected."

		if (!$selected) {
			$selected = @$_GET[$parameter];
		}

		foreach ($options as $k => $v) {
			if ($selected == $v) {
				$options[$k] = "<u>{$v}</u>";
			} else {
				$options[$k] = "<a href='?{$parameter}={$v}'>{$v}</a>";
			}
		}

		return join(" | ", $options);
	} // sort_selector()


	function result_pager($q) {
		$rv = '';

		$defaults = array(
			'page' => 1,
			'total_pages' => 1,
			'page_var' => 'page',
			'divider' => ' - ',
			'first' => 'first',
			'previous' => 'previous',
			'next' => 'next',
			'last' => 'last'
		);

		foreach ($defaults as $k => $v) {
			if (!isset($q[$k]) || !$q[$k]) {
				$q[$k] = $v;
			}
		}

		if ($q['page'] > 1) {
			$_GET[$q['page_var']] = 1;
			$rv .= "<a href='?" . http_build_query($_GET, '', '&amp;') . "'>{$q['first']}</a>{$q['divider']}";

			$_GET[$q['page_var']] = $q['page'] - 1;
			$rv .= "<a href='?" . http_build_query($_GET, '', '&amp;') . "'>{$q['previous']}</a>";
		} else {
			$rv .= "{$q['first']}{$q['divider']}{$q['previous']}";
		}

		$rv .= $q['divider'];
		
		$pager_span = 9;
		// $left_page = max($q['page'] - ($q['page'] % 10) - 10, 1);
		$left_page = max($q['page'] - $pager_span, 1);
		$pager_pages = array();
		for ($i = $left_page; $i <= min($q['page'] + $pager_span, (int)$q['total_pages']); $i++) {
			$_GET[$q['page_var']] = $i;
			if ($i == $q['page']) {
				$pager_pages[] = "<b><u>{$i}</u></b>";
			} else {
				$_GET[$q['page_var']] = $i;
				$pager_pages[] = "<a href='?" . http_build_query($_GET, '', '&amp;') . "'>{$i}</a>";
			}

		}
		
		$rv .= join(' ', $pager_pages);

		$rv .= $q['divider'];
		
		// $last_page = min($result['total_pages'], 400);
		if ($q['total_pages'] > $q['page']) {
			$_GET[$q['page_var']] = $q['page'] + 1;
			$rv .= "<a href='?" . http_build_query($_GET, '', '&amp;') . "'>{$q['next']}</a>{$q['divider']}";

			$_GET[$q['page_var']] = $q['total_pages'];
			$rv .= "<a href='?" . http_build_query($_GET, '', '&amp;') . "'>{$q['last']}</a>";
		} else {
			$rv .= "{$q['next']}{$q['divider']}{$q['last']}";
		}

		$_GET[$q['page_var']] = $q['page'];

		return $rv;
	} // result_pager()

	
	function my_error() {
		global $db;
		return mysqli_error($db);
	} // my_error()


	function my_fetch_assoc($result) {
		return mysqli_fetch_assoc($result);
	} // my_fetch_assoc()


	function my_insert_id($database = false) {
		if (!$database) {
			global $db;
			$database = $db;
		}
		return mysqli_insert_id($database);
	} // my_insert_id()


	function my_user_or_session($table = false) {
		if ($table) {
			$table = $table . '.';
		} else {
			$table = "";
		}

		$user_id = get_user_id();
		if ($user_id) {
			return "{$table}user_id='{$user_id}'";
		} else {
			$session_id = session_id();
			return "(user_id=0 and session_id='{$session_id}')";
		}

	} // my_user_or_session()


	function my_start_transaction($database = false) {
		global $transaction_depth;
		if ($transaction_depth == 0) {
			$rv = my_query("start transaction");
		} else {
			$rv = my_query("savepoint p{$transaction_depth}");
		}

		if ($rv) {
			$transaction_depth++;
		}

		return $rv;
	} // my_start_transaction()


	function my_commit() {
		global $transaction_depth;

		$transaction_depth--;
		if ($transaction_depth <= 0) {
			$transaction_depth = 0;
			return my_query("commit");
		} else {
			return true;
		}
	} // my_commit()


	function my_rollback() {
		global $transaction_depth;

		$transaction_depth--;
		if ($transaction_depth <= 0) {
			$transaction_depth = 0;
			return my_query("rollback");
		} else {
			return my_query("rollback to p{$transaction_depth}");
		}

	} // my_rollback()


	function my_select($table, $o, $options = false) {
		global $db;
		$columns_clause = '*';
		$table = $table; // sanitize($table);
		$where_clause = my_where($o);
		$group_clause = '';
		$having_clause = '';
		$order_clause = '';
		$limit_clause = '';

		if (strlen(trim($where_clause)) > 0) {
			$where_clause = " where {$where_clause} ";
		}

		if ($options && is_array($options)) {

			// limit
			if (isset($options['limit'])) {
				$l = $options['limit'];
				if (isset($l['count'])) {
					$limit_clause = 'limit ';
					if (isset($l['offset'])) {
						$limit_clause .= (int)$l['offset'] . ',';
					}
					$limit_clause .= (int)$l['count'];
				} elseif (is_numeric($l)) {
					$limit_clause = 'limit ' . (int)$l;
				}
			}

			// order
			if (isset($options['order'])) {
				$order_clause = 'order by ' . $options['order'];
			}

			// columns
			if (isset($options['fields']) && !isset($options['columns'])) {
				$options['columns'] = $options['fields'];
			}

			if (isset($options['columns'])) {
				if (is_array($options['columns'])) {
					$columns_clause = join(',', $options['columns']);
				} else {
					$columns_clause = $options['columns'];
				}
			}

			// group
			if (isset($options['group'])) {
				if (is_array($options['group'])) {
					$group_clause = 'group by ' . join(',', $options['group']);
				} else {
					$group_clause = 'group by ' . $options['group'];
				}
			}

			// others not implemented yet.
			// implement as needed.

		}

		$query = "select {$columns_clause} from {$table} {$where_clause} {$group_clause} {$having_clause} {$order_clause} {$limit_clause}";

		if (isset($options['sql']) && $options['sql']) {
			return $query;
		}

		if ($result = my_query($query, $db)) {
			$rv = array();
			while ($row = my_fetch_assoc($result)) {
				$rv[] = $row;
			}
			return $rv;
		} else {
			throw new Exception("Query failed: " . my_error() . "\nQuery: " . $query);
		}
	} // my_select()	


	function my_insert($table, $o) {
		global $db;
		if (isset($o) && is_array($o)) {
			if (sizeof($o) == 0) {
				return true;
			}

			$table = sanitize($table);
			$sets = my_set($o);

			$query = "insert into {$table} set {$sets}";
			if ($result = my_query($query, $db)) {
				return my_insert_id($db);
			} else {
				return false;
			}
		} else {
			throw new Exception("\$o must be an array containing key/value pairs to INSERT.");
		}
	} // my_insert()


	function my_update($table, $pk_name, $o) {
		global $db;
		if (isset($o) && is_array($o)) {
			if (sizeof($o) == 0) {
				return false;
			}

			$pk_value = sanitize($o[$pk_name]);
			if (!$pk_value) {
				return false;
			}

			unset($o[$pk_name]);
			$table = sanitize($table);
			$sets = my_set($o);
			
			$query = "update {$table} set {$sets} where `{$pk_name}`='{$pk_value}'";
			if ($result = my_query($query, $db)) {
				return $result;
			} else {
				return false;
			}
		} else {
			throw new Exception("\$o must be an array containing key/value pairs to UPDATE.");
		}
	} // my_update()


	function my_delete($table, $where, $delete_all = false) {
		global $db;
		$table = sanitize($table);
		$where_clause = my_where($where);
		if (strlen(trim($where_clause)) > 0) {
			$where_clause = " where {$where_clause} ";
		}

		if (strlen($where_clause) == 0 && !$delete_all) {
			throw new Exception("No where conditions provided to my_delete(). Set 3rd parameter to TRUE to delete ALL ROWS from a table.");
		}

		$query = "delete from {$table} {$where_clause}";
		if ($result = my_query($query, $db)) {
			return my_affected_rows($db);
		} else {
			throw new Exception("Query failed: " . my_error());
		}
	} // my_delete()


	function insert_user($o) {
		global $db;
		if (is_array($o)) {
			if (
				isset($o['username'], $o['password'])
			) {
				if (!isset($o['name'])) {
					$o['name'] = $o['username'];
				}
				$o['name'] = htmlentities($o['name'], ENT_QUOTES, 'utf-8');

				$o = sanitize($o);

				if (isset($o['userdata'])) {
					$query = "insert into users (username, password, name, userdata) values ('{$o['username']}','{$o['password']}','{$o['name']}','{$o['userdata']}')";
				} else {
					$query = "insert into users (username, password, name) values ('{$o['username']}','{$o['password']}','{$o['name']}')";
				}

				if (my_query($query, $db)) {
					return my_insert_id($db);
				} else {
					throw new Exception("Query failed: " . my_error());
				}
			} else {
				throw new Exception("\$o must be an array containing a username and password. (2)");
			}
		} else {
			throw new Exception("\$o must be an array containing a username and password. (1)");
		}
	} // insert_user()


	function update_user($o) {
		$user = array();

		if (!isset($o['user_id']) || !$o['user_id']) {
			return false;
		}

		$fields = array(
			'user_id', 'username', 'password', 'name', 'userdata', 'admin', 'favorite_thing_id'
		);

		foreach ($fields as $f) {
			if (isset($o[$f])) {
				$user[$f] = $o[$f];
			}
		}

		return my_update('users', 'user_id', $user);
	} // update_user()


	function select_user($o) {
		if (is_array($o)) {
			if (isset($o['user_id']) && (int)$o['user_id'] >= 0) {
				if ($o['user_id'] == 0) {
					$rows = array(array(
						'user_id' => 0,
						'name' => 'thepointless.com notifier',
						'username' => 'thepointless.com notifier',
						'userdata' => '{bio:"thepointless.com notification system"}'
					));
				} else {
					$rows = my_select('users', array('user_id' => (int)$o['user_id']));
				}
			} elseif (isset($o['username']) && $o['username']) {
				$rows = my_select('users', array('username' => $o['username']));
			} else {
				throw new Exception("\$o must be an array containing a user_id and/or username.");
			}

			if ($rows && sizeof($rows) > 0) {
				$user = $rows[0];
				return $user;
			} else {
				return false;
			}
		} else {
			throw new Exception("\$o must be an array containing a user_id and/or username.");
		}
	} // select_user()


	function select_somethings($o) {
		global $db;

		$default_pagesize = -10;
		$max_pagesize = 250;
		$where = array("message!=''");

		if (isset($o['pagesize'])) {
			$pagesize = (int)$o['pagesize'];
			$pagesize = min($max_pagesize, $pagesize);
			$pagesize = max(-1 * $max_pagesize, $pagesize);

			if ($pagesize == 0) {
				$pagesize = $default_pagesize;
			}
		} else {
			$pagesize = $default_pagesize;
		}

		if ($pagesize < 0) {
			$sort = 'desc';
			$direction = '<';
		} else {
			$sort = 'asc';
			$direction = '>';
		}

		$pagesize = abs($pagesize);

		if (isset($o['id'])) {
			$id = (int)$o['id'];
			$id = max(0, $id);
		} else {
			$id = false;
		}

		if ($id) {
			$where[] = "something_id {$direction} {$id}";
		}

		$where_clause = 'where ' . join(' and ', $where);
		$query = "select * from (select * from somethings {$where_clause} order by something_id {$sort} limit {$pagesize}) tt order by something_id asc";
		// print $query . "\n";
		if ($result = my_query($query, $db)) {
			$rv = array();
			while ($row = my_fetch_assoc($result)) {
				$rv[] = $row;
			}

			// DEBUG
			// print "<pre>" . print_r($rv, 1) . "</pre>\n";
			// exit();

			return $rv;
		} else {
			throw new Exception("SQL Error: " . my_error());
		}
	} // select_somethings()


	function select_proverbs_count($where = array()) {
		global $db;

		$where_clause = my_where($where);
		if (sizeof(trim($where_clause)) > 0) {
			$where_clause = " where {$where_clause} ";
		}

		$query = "select count(*) proverbs
			from proverbs p
			{$where_clause}
		";

		$result = my_query($query, $db);
		if ($row = my_fetch_assoc($result)) {
			return $row['proverbs'];
		} else {
			return 0;
		}
	} // select_proverbs_count()


	function select_proverbs($where = array(), $page = 1, $order = "p.created desc") {
		global $db, $proverbs_page_size;

		$limit_clause = my_limit(array(
			'page' => $page,
			'order' => $order,
			'pagesize' => $proverbs_page_size
		));
		$where_clause = my_where($where);

		$query = "select *,
			(
				select if(count(*) > 0, 1, 0)
				from proverb_votes pv
				where
					pv.proverb_id=p.proverb_id
					and " . my_user_or_session("pv") . "
			) as user_vote

			from proverbs p
			where {$where_clause}
			{$limit_clause}
		";

		$result = my_query($query, $db);
		$rv = array();
		while ($row = my_fetch_assoc($result)) {
			$rv[] = $row;
		}
		return $rv;
	} // select_provebs()


	function select_popular_proverbs($type, $page = 1) {
		return select_proverbs(array('type' => $type), $page, "p.likes desc");
	} // select_popular_proverbs()


	function select_trending_proverbs_threshold($type) {
		$where_clause = my_where(array(
			'type' => $type
		));
		$query = "select max(likes) max_likes from proverbs where {$where_clause}"; 
		$result = my_query($query);

		if ($row = my_fetch_assoc($result)) {
			$max_likes = $row['max_likes'];
		} else {
			$max_likes = 0;
		}

		$threshold = floor($max_likes * 0.1);

		return $threshold;
	} // select_trending_proverbs_threshold()

	function select_trending_proverbs_count($type) {
		$threshold = select_trending_proverbs_threshold($type);
		$where_clause = my_where(array(
			'type' => $type,
			'likes>=' => $threshold
		));
		$query = "select count(*) count from proverbs where {$where_clause}";
		$result = my_query($query);
		if ($row = my_fetch_assoc($result)) {
			return $row['count'];
		} else {
			return 0;
		}
	} // select_trending_proverbs_count()


	function select_trending_proverbs($type, $page = 1) {
		$threshold = select_trending_proverbs_threshold($type);
		return select_proverbs(
			array('likes >=' => $threshold, 'type' => $type),
			$page, "p.modified desc, p.likes desc"
		);
	} // select_trending_proverbs()


	function select_random_proverbs($type, $count = 1) {
		global $db;

		$stats = my_select('proverbs',
			array('type' => $type),
			array('fields' => array(
				'max(proverb_id) max_id',
				'min(proverb_id) min_id',
				'count(*) count'
			))
		);
		$stats = $stats[0];
		$max_id = $stats['max_id'];
		$min_id = $stats['min_id'];
		$count = min($count, $stats['count']);

		// get $count random rows
		$rv = array();
		for ($i = 0; $i < $count; $i++) {
			$search_id = rand($min_id, $max_id);
			$possibles = select_proverbs(
				array(
					'proverb_id>=' => $search_id,
					'type' => $type
				),
				1, 	// page
				'p.proverb_id asc'	// order
			);
			if (sizeof($possibles) > 0) {
				$rv[] = $possibles[0];
			}
		}

		return $rv;

	} // select_random_proverbs()


	function select_proverb($id) {
		$rows = select_proverbs(
			array('proverb_id' => $id),
			1, "p.created desc"
		);

		if (sizeof($rows) > 0) {
			return $rows[0];
		} else {
			return null;
		}
	} // select_proverb()


	function insert_proverb($type, $text) {
		$table = "proverbs";
		$row = array(
			'type' => $type,
			'proverb_text' => $text,
			'session_id' => session_id(),
			'user_id' => get_user_id(),
			'created' => new SafeLiteral("now()")
		);
		return my_insert($table, $row);
	} // insert_proverb()


	function insert_proverb_vote($proverb_id) {
		global $db;

		// start transaction
		// my_query("start transaction", $db);
		my_start_transaction();

		// define the vote record
		$table = 'proverb_votes';
		$row = array(
			'proverb_id' => $proverb_id,
			'session_id' => session_id(),
			'user_id' => get_user_id() 
		);

		// check for an existing vote
		$proverb = select_proverb($proverb_id);

		if ($proverb['user_vote'] == '0') {
			// no existing vote for this user. add one.
			my_insert($table, $row);

			// increment the counter
			$votes_added = my_affected_rows($db);
			if ($votes_added > 0) {
				my_query("update proverbs set likes=likes+{$votes_added} where proverb_id='{$proverb_id}'");
			}
		} else {
			$votes_added = 0;
		}

		// commit
		// my_query("commit", $db);
		my_commit();
		
		// return RV
		return $votes_added;
	} // insert_proverb_vote()


	function delete_proverb_vote($proverb_id) {
		global $db;

		// start transaction
		// my_query("start transaction", $db);
		my_start_transaction();

		// remove the vote
		$proverb_id = sanitize($proverb_id);
		$session_id = session_id();
		$user_id = get_user_id();
		$query = "delete from proverb_votes where proverb_id='{$proverb_id}' and " . my_user_or_session();
		my_query($query, $db);

		// decrement the counter
		$votes_deleted = my_affected_rows($db);
		if ($votes_deleted > 0) {
			my_query("update proverbs set likes=likes-{$votes_deleted} where proverb_id='{$proverb_id}'");
		}

		// commit
		// my_query("commit", $db);
		my_commit();

		// return RV
		return $votes_deleted;
	} // delete_proverb_vote()


?>
