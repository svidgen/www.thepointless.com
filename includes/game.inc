<?php

	require_once('includes/auth.inc');
	require_once('includes/dbconnect.inc');


	//
	// "GLOBALS"
	//
	$parent_event_id = 0;

	
	//
	// CONSTANTS
	// 
	define("CHALLENGE_NOT_ACCEPTED", 1);
	define("CHALLENGE_CANNOT_ACCEPT", 2);
	define("CHALLENGE_ACCEPTED", 3);
	define("CHALLENGE_COMPLETED", 4);
	define("CHALLENGE_REPEATABLE", 5);
	define("CHALLENGE_HAS_PREREQUISITES", 6);
	define("CHALLENGE_WITHDRAWN", 7);
	define("CHALLENGE_ACCEPTED_WITHDRAWN", 8);


	//
	// STALKER RELATIONSHIPS
	//

	function select_stalker_relationships(
		$conditions = array(), $options = array()
	) {
		return my_select('stalker_relationships', $conditions, $options);
	} // select_stalker_relationships()


	function select_stalkers($victim, $options = array()) {
		if (!isset($options['fields'])) {
			$options['fields'] = 'u.*';
		}

		return my_select(
			"stalker_relationships sr
			left join users u on (u.user_id=sr.stalker_id)",
			array('victim_id' => $victim['user_id']),
			$options
		);
	} // select_stalkers()


	function select_victims($stalker, $options = array()) {
		if (!isset($options['fields'])) {
			$options['fields'] = 'u.*';
		}

		return my_select(
			"stalker_relationships sr
			left join users u on (u.user_id=sr.victim_id)",
			array('stalker_id' => $stalker['user_id']),
			$options
		);
	} // select_victims()


	function insert_stalker($stalker, $victim) {
		return my_insert('stalker_relationships', array(
			'stalker_id' => $stalker['user_id'],
			'victim_id' => $victim['user_id']
		));
	} // insert_stalker()


	function delete_stalker($stalker, $victim) {
		return my_delete('stalker_relationships', array(
			'stalker_id' => $stalker['user_id'],
			'victim_id' => $victim['user_id']
		));
	} // delete_stalker()


	//
	// PLACES
	//

	function insert_place($place) {
		$row = filtered_row(
			$place,
			array('name','icon_id','details')
		);

		return my_insert('places', $row);
	} // insert_place()


	function update_place($place) {
		$row = filtered_row(
			$place,
			array('place_id','name','icon_id','details')
		);
		return my_update('places', 'place_id', $row);
	} // update_place()


	function select_places($criteria = array(), $options = array()) {
		return my_select('places', $criteria, $options);
	} // select_place()


	function select_place($id_or_name) {
		if (is_string($id_or_name)) {
			$rows = select_places(array('name' => $id_or_name));
		} else {
			$rows = select_places(array('place_id' => (int)$id_or_name));
		}
		if (sizeof($rows) > 0) {
			return $rows[0];
		} else {
			return null;
		}
	} // select_place()


	function delete_place($place) {
		throw new Exception("Not yet implemented.");
	} // delete_place()


	function select_linked_places($place) {
		return my_select(
			'place_place pp left join places p on (p.place_id=pp.place_b_id)',
			array(
				'pp.place_a_id' => $place['place_id']
			),
			array(
				'fields' => 'p.*'
			)
		);
	} // select_linked_places()


	function can_link_to_place($place) {
		$links = select_linked_places($place);
		if (sizeof($links) < 4) {
			return true;
		} else {
			return false;
		}
	} // can_link_to()


	function link_places($place_a, $place_b, $bidirectional = true) {
		if ($bidirectional) {
			$ok = my_start_transaction();

			if ($ok) {
				$ok = link_places($place_a, $place_b, false);
			}

			if ($ok) {
				$ok = link_places($place_b, $place_a, false);
			}

			if ($ok) {
				return my_commit();
			} else {
				my_rollback();
				return false;
			}

		} else {
			return my_insert('place_place', array(
				'place_a_id' => (int)$place_a['place_id'],
				'place_b_id' => (int)$place_b['place_id']
			));
		}
	} // link_places()


	function unlink_place($place_a, $place_b, $both_directions = true) {
		$ok = my_start_transaction();

		if ($ok) {
			$ok = my_delete('place_place', array(
				'place_a_id' => $place_a['place_id'],
				'place_b_id' => $place_b['place_id']
			));
		}

		if ($ok && $both_directions) {
			$ok = my_delete('place_place', array(
				'place_a_id' => $place_b['place_id'],
				'place_b_id' => $place_a['place_id']
			));
		}

		if ($ok) {
			return my_commit();
		} else {
			my_rollback();
			return false;
		}
	} // unlink_places()


	//
	// PLACE_THING
	//

	$place_thing_fields = array(
		'place_thing_id', 'place_id', 'thing_id', 'mode',
		'spawn_chance', 'quantity'
	);

	function insert_place_thing($pt) {
		$row = filtered_row($pt, $GLOBALS['place_thing_fields']);
		return my_insert('place_thing', $row);
	} // insert_place_thing()

	function update_place_thing($pt) {
		$row = filtered_row($pt, $GLOBALS['place_thing_fields']);
		return my_update('place_thing', 'place_thing_id', $row);
	} // update_place_thing()

	function add_drop($place, $thing, $quantity = 1) {
		$ok = my_start_transaction();

		if ($ok) {
			$ok = select_place_things(array(
				'place_id' => $place['place_id'],
				'thing_id' => $thing['thing_id'],
				'mode' => 'drop'
			));
		}

		if ($ok !== false) {
			if (sizeof($ok) > 0) {
				$row = $ok[0];
				$row['quantity'] += $quantity;
				$ok = update_place_thing($row);
			} else {
				$ok = insert_place_thing(array(
					'place_id' => $place['place_id'],
					'thing_id' => $thing['thing_id'],
					'mode' => 'drop',
					'quantity' => (int)$quantity
				));
			}
		}

		if ($ok) {
			return my_commit();
		} else {
			my_rollback();
			return false;
		}
	} // add_drop()

	function select_place_things($criteria, $options = array()) {
		global $place_thing_fields;
		$c = filtered_row($criteria, $place_thing_fields);

		if (isset($c['place_id'])) {
			$c['pt.place_id'] = $c['place_id'];
			unset($c['place_id']);
		}

		if (isset($c['thing_id'])) {
			$c['pt.thing_id'] = $c['thing_id'];
			unset($c['thing_id']);
		}

		return my_select(
			'place_thing pt left join things t on (t.thing_id=pt.thing_id)',
			$c, $options
		);
	} // select_place_things()

	// could use a more meaningful name for this ... 
	function select_place_visible_things($place) {
		$rows = select_place_things(array(
			'place_id' => $place['place_id'],
			'quantity>' => '0'
		));

		$pool = array();
		$rv = array();
		foreach ($rows as $row) {
			if ($row['mode'] == 'static') {
				$rv[] = $row;
			} elseif (sizeof($rv) < 4) {
				if ($row['mode'] == 'spawn') {
					if (rand() <= $row['spawn_chance']) {
						$row['quantity'] += 1;
						update_place_thing($row);
					}
				}
				$pool[] = $row;
			}
		}

		shuffle($pool);
		while (sizeof($pool) > 0 && sizeof($rv) < 4) {
			$item = array_shift($pool);
			if (rand(0,9) < $item['quantity']) {
				$rv[] = $item;
			}
		}

		// the client should only see 1 of each returned thing.
		foreach ($rv as $k => $v) {
			$rv[$k]['quantity'] = 1;
		}

		return $rv;
	} // select_place_visible_things()

	function delete_place_thing($criteria) {
		return my_delete('place_thing', $criteria);
	} // delete_place_thing()


	//
	// THINGS
	//

	$thing_fields = array(
		'thing_id', 'name', 'icon_id', 'enabled', 'details'
	);

	function insert_thing($thing) {
		$row = array(
			'name' => normalize($thing['name']),
			'enabled' => isset($thing['enabled']) ? $thing['enabled'] : 1,
			'icon_id' => isset($thing['icon_id']) ? $thing['icon_id'] : 0
		);
		return my_insert("things", $row);
	} // insert_thing()


	function update_thing($thing) {
		$row = array(
			'thing_id' => $thing['thing_id'],
			'name' => normalize($thing['name']),
			'enabled' => isset($thing['enabled']) ? $thing['enabled'] : 1,
			'icon_id' => $thing['icon_id'],
			'details' => $thing['details']
		);
		return my_update("things", "thing_id", $row);
	} // update_thing()


	function delete_thing($thing) {
		return my_update("things", "thing_id", array(
			'thing_id' => $thing['thing_id'],
			'enabled' => false
		));
	} // delete_thing()


	function select_things($criteria, $options = array()) {
		return my_select("things", $criteria, $options);
	} // select_things()


	function select_thing($criteria) {
		if (is_array($criteria)) {
			$q = $criteria;
		} else {
			$id = (int)$criteria;
			$q = array('thing_id' => $id);
		}
		$rows = select_things($q);
		if (sizeof($rows) > 0) {
			$rv = $rows[0];
		} else {
			$rv = null;
		}
		return $rv;
	} // select_thing()


	function select_challenge_things($challenge_id) {
		$table = "challenge_thing ct left join things t on (ct.thing_id=t.thing_id)";
		return my_select($table, array(
			"ct.challenge_id" => $challenge_id,
			"t.enabled" => 1
		));
	} // select_challenge_things()


	function get_thing_id($thing) {
		if (@$thing['thing_id'] > 0) {
			$thing_id = $thing['thing_id'];
		} else {
			$existing = select_things(array(
				'name' => $thing['name']
			));

			if (sizeof($existing) > 0) {
				$thing_id = $existing[0]['thing_id'];
			} else {
				$thing_id = insert_thing($thing);
			}
		}
		return $thing_id;
	} // get_thing_id()



	//
	// USER THINGS
	// 


	function select_things_with_stats($criteria) {

		$thing_fields = array('thing_id','name');
		foreach ($criteria as $k => $v) {
			if (in_array($k, $thing_fields)) {
				$criteria['t.' . $k] = $v;
				unset($criteria[$k]);
			}
		}

		$criteria['quantity>'] = 0;

		$rv = my_select(
			'user_thing ut left join things t on (t.thing_id=ut.thing_id)',
			$criteria,
			array(
				'fields' => array(
					't.*',
					'sum(ut.quantity) total_owned',
					'max(ut.quantity) most_owned',
					'min(ut.quantity) fewest_owned',
					'sum(ut.quantity)/(select count(*) from users) average_owned',
					'count(ut.user_id) users_owning',
					'(select sum(quantity) from user_thing) total_things',

					// TODO: rewrite these using proper entity subselects

					join(array(
						"(count(user_id)/",
						"(select count(*) from users)) rarity_value"
					),''),

					join(array(
						"(select name from rarity where threshold>=",
						"(count(user_id)/(select count(*) from users))",
						" order by threshold asc limit 1) rarity"
					),''),
					
				),
				'sql' => 0
			)
		);

		return $rv;
	
	} // select_things_with_stats()


	function get_thing_stats($thing) {
		$stats_collection = select_things_with_stats($thing);
		return $stats_collection[0];
	} // selec_thing_stats()


	// currently only returns ranking info.
	function select_user_thing_stats($criteria, $options = array()) {
		$rv = array();

		if (!$criteria['user_id']) {
			$criteria['user_id'] = get_user_id();
		}

		$rows = select_user_things($criteria);

		if (sizeof($rows) > 0) {
			$rv = $rows[0];
		} else {
			if (isset($criteria['thing_id'])) {
				$rows = select_things(
					array('thing_id' => $criteria['thing_id'])
				);
				if (sizeof($rows) > 0) {
					$rv = $rows[0];
					$rv['quantity'] = 0;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}

		$options['limit'] = 2;
		$options['sql'] = 0;

		unset($criteria['user_id']);
		$criteria['quantity>'] = (int)$rv['quantity'];
		$options['order'] = 'quantity asc';
		$rows = select_user_things($criteria, $options);
		$rv['users_with_more'] = array_reverse($rows);

		unset($criteria['quantity>']);
		$criteria['quantity<'] = (int)$rv['quantity'];
		$options['order'] = 'quantity desc';
		$rows = select_user_things($criteria, $options);
		$rv['users_with_less'] = $rows;

		return $rv;
	} // select_user_thing_stats()


	function select_user_thing($thing, $user = false) {
	} // select_user_thing_quantity()


	function select_user_things($criteria = array(), $options = array()) {
		$valid_fields = array(
			'user_thing_id',
			'user_id',
			'thing_id',
			'quantity',
			'quantity>',
			'quantity>=',
			'quantity<',
			'quantity<='
		);
		$c = filtered_row($criteria, $valid_fields);
		$c = prefix_keys($c, 'ut.');

		if (isset($criteria['name'])) {
			$c['t.name'] = $criteria['name'];
		}

		// if explicit quantity criteria are not included,
		// look only for rows with a positive quantity.
		if (anyof($c, array(
				'ut.quantity',
				'ut.quantity>',
				'ut.quantity>=',
				'ut.quantity<',
				'ut.quantity<='
			)) === false
		) {
			$c['ut.quantity>'] = 0;
		}

		if (!isset($options['order'])) {
			$options['order'] = 't.name asc';
		}

		if (!isset($options['fields'])) {
			$options['fields'] = 'ut.*, t.*, u.username, u.name user_name';
		}

		return my_select(
			join(array("user_thing ut",
				"left join things t on (t.thing_id=ut.thing_id)",
				"left join users u on (u.user_id=ut.user_id)"
			), ' '),
			$c,
			$options
		);
	} // select_user_things()


	function select_user_turnins($challenge_id, $user_id = false) {
		if (!$user_id) {
			$user_id = get_user_id();
		}
		$conditions = array(
			'ut.user_id' => (int)$user_id,
			'ct.challenge_id' => (int)$challenge_id,
			'ct.quantity <' => 0
		);
		$where = my_where($conditions);
		if ($where) { $where = "where {$where}"; }
		$query = "select ct.thing_id, ct.quantity challenge_quantity, ut.quantity user_quantity from challenge_thing ct left join user_thing ut on (ct.thing_id=ut.thing_id) {$where}";
		$result = my_query($query);
		$rv = array();
		while ($row = my_fetch_assoc($result)) {
			$rv[] = $row;
		}
		return $rv;
	} // select_user_turnins()


	function add_user_thing($thing, $user_id = false, $title = false, $url = false) {
		if (!$user_id) {
			$user_id = get_user_id();
			if (!$user_id) {
				if (!isset($_SESSION['award_q'])) {
					$_SESSION['award_q'] = array();
				}

				// errm ... why am I including the user_id here?
				// it's always false ... 
				$_SESSION['award_q'][] = array($thing, $user_id);

				// ... whatev.
				return $thing['quantity'];
			}
		}

		// we have a few things to do there ... 
		// my_query('start transaction');
		my_start_transaction();

		// does this thing exist yet?
		// if it has an ID, assume it does:
		if (!isset($thing['thing_id'])) {
			if (!isset($thing['name'])) {
				// my_query('rollback');
				my_rollback();

				return false;
			} else {
				$existing = select_things(array('name' => $thing['name']));
				if (sizeof($existing) > 0) {
					$thing['thing_id'] = $existing[0]['thing_id'];
				} else {
					$thing['thing_id'] = insert_thing($thing);
				}
			}
		}

		// does the user already have record for this thing?
		$existing = my_select("user_thing", array(
			'user_id' => (int)$user_id,
			'thing_id' => (int)$thing['thing_id']
		));

		if (sizeof($existing) > 0) {
			// yes. update the existing record.
			$qty = (int)$existing[0]['quantity'] + (int)$thing['quantity'];
			$rv = my_query("update user_thing set quantity='{$qty}' where user_id='{$user_id}' and thing_id='{$thing['thing_id']}'");
		} else {
			// no. create a new record.
			$rv = my_insert("user_thing", array(
				'user_id' => (int)$user_id,
				'thing_id' => $thing['thing_id'],
				'quantity' => $thing['quantity']
			));
		}

		insert_event(array(
			'user_id' => $user_id,
			'thing_id' => $thing['thing_id'],
			'quantity' => $thing['quantity'],
			'page_title' => $title,
			'url' => $url
		));

		// my_query('commit');
		my_commit();

		return $rv;
	} // add_user_thing()


	function allow_award($award_cap) {
		return allow_awards(array($award_cap));
	} // allow_award()


	function allow_awards($award_caps) {
		global $meta_title, $html_title, $award_token;
		if (is_array($award_caps) && sizeof($award_caps) > 0) {
			
			if (isset($award_token)) {
				$game_action = get_token($award_token);
			}

			if (!isset($game_action) || !is_array($game_action)) {
				$game_action = array(
					'action' => 'award',
					'page_title' => isset($html_title) && $html_title ? $html_title : $meta_title,
					'url' => $_SERVER['REQUEST_URI'],
					'caps' => array()
				);
			}

			foreach ($award_caps as $cap) {
				$game_action['caps'][] = $cap;
			}


			// if an award token is already present, create a new global
			// award token that includes all awards. but also leave the
			// old award token in tact, in case some outdated code, that which
			// isn't using TPDC.award(), is relying on it.
			if ($award_token) {
				$new_token = add_token($game_action);
				$award_token = add_token($game_action, $award_token);
				return $new_token;
			} else {
				$award_token = add_token($game_action);
				return $award_token;
			}

		} else {
			return '';
		}
	} // awards_key()


	function award_cap($name, $max_quantity = 1, $rate_limit = 1, $scalable = false) {
		return array(
			'cap_type' => 'rate limit',
			'thing' => $name,
			'max' => (int)$max_quantity,
			'rate' => (int)$rate_limit,
			'scalable' => (bool)$scalable,
			'next_allowed' => time()
		);
	} // award_cap()


	function page_award_cap($name, $max_quantity = 1, $rate_limit = 1, $scalable = false) {
		throw new Exception("Page caps not yet implemented.");
	} // page_award_cap()


	function global_award_cap($name, $max_quantity = 1, $rate_limit = 1, $scalable = false) {
		throw new Exception("Global caps not yet implemented.");
	} // global_award_cap()


	function inventory_cap($name, $limit) {
		return array(
			'cap_type' => 'inventory cap',
			'thing' => $name,
			'limit' => (int)$limit
		);
	} // inventory_cap()


	function get_last_awarded($thing, $user) {
		$last_awarded = 0;

		if ($user) {
			// a user who doesn't have an awardable thing is under the limit.
			$rows = select_user_things(array(
				'user_id' => $user['user_id'],
				'thing_id' => $thing['thing_id']
			));
			$user_thing = $rows[0];
			$last_awarded = strtotime($user_thing['modified']);
		}

		if (!isset($_SESSION['last_awarded'])) {
			$_SESSION['last_awarded'] = array();
		}

		if (isset($_SESSION['last_awarded'][$thing['name']])) {
			$last_awarded = max(
				$last_awarded,
				$_SESSION['last_awarded'][$thing['name']]
			);
		}

		return $last_awarded;
	} // get_last_awarded()


	function get_inventory_quantity($thing, $user = false) {
		if (!$user) {
			$user = get_authenticated_user();
		}

		$quantity = 0;
		if ($user) {
			$q = array('user_id' => $user['user_id'], 'name' => $thing['name']);
			$rows = select_user_things($q);
			$user_thing = $rows[0];
			$quantity = $user_thing['quantity'];
		} else {
			if (!isset($_SESSION['award_q'])) {
				$_SESSION['award_q'] = array();
			}
			
			foreach ($_SESSION['award_q'] as $award) {
				$award_thing = $award[0];
				if ($award_thing['name'] == $thing['name']) {
					$quantity += (int)$award_thing['quantity'];
				}
			}
		}

		return (int)$quantity;
	} // get_inventory_quantity()


	function next_awardable($thing, $user = false) {
		if (!$thing || !$thing['enabled']) {
			return pow(2,32);
		}

		$last_awarded = get_last_awarded($thing, $user);

		// if the user has received ANY quantity of the thing within the
		// the "max award delay," they cannot have any more right now.
		$next_awardable_time = $last_awarded + (int)$thing['min_award_delay'];
		$next_awardable = $next_awardable_time - time();
		$rv = max($next_awardable, 0);

		return $next_awardable;
	} // next_awardable()


	function max_awardable($thing, $user = false) {
		if (next_awardable($thing, $user) <= 0) {
			return (int)$thing['max_per_award'];
		} else {
			return 0;
		}
	} // max_awardable()


	function award($name, $qty = 1, &$cap = false, $title = false, $url = false, $user = false) {
		$awarded = 0;

		$thing = select_thing(array('name' => $name));
		$max_awardable = max_awardable($thing, $user);
		// print "/* " . print_r($thing, true) . " */ ";
		// print "/* {$max_awardable} */ ";

		if (!$cap) {
			$qty = min($qty, $max_awardable);
			if ($qty == 0) {
				$awarded = 0;
			} else {
				$thing_qty = array('name' => $name, 'quantity' => $qty);
				if (add_user_thing($thing_qty, $user, $title, $url)) {
					$_SESSION['last_awarded'][$name] = time();
					$awarded = $qty;
				} else {
					$awarded = 0;
				}
			}
		} else {
			if ($cap['cap_type'] == 'rate limit') {
				$awarded = award_with_rate_limit($name, $qty, $cap, $title, $url, $user);
			} elseif ($cap['cap_type'] == 'inventory cap') {
				$awarded = award_with_inventory_cap($cap['thing'], $qty, $cap['limit'], $title, $url, $user);
			}
		}

		$stats = get_thing_stats($thing);

		return array(
			'item' => $name,
			'awarded' => $awarded,
			'total' => get_inventory_quantity($thing, $user),
			'stats' => $stats,
			'next_awardable' => next_awardable($thing, $user)
		);

	} // award()


	function award_with_rate_limit($name, $qty = 1, &$c = false, $title = false, $url = false, $user_id = false) {
		// make sure the given cap applies to the intended award
		if (strtolower(trim($c['thing'])) != strtolower(trim($name))) {
			return 0;
		}

		// make sure we haven't exceeded our rate limit
		$now = time();
		if ($c['next_allowed'] > $now) {
			return 0;
		}

		// determine max award based on cap's max and scalability
		if ($c['scalable']) {
			$max = floor( ($c['max']/$c['rate']) * ($c['rate'] + ($now - $c['next_allowed'])));
		} else {
			$max = (int)$c['max'];
		}

		// determine qty to award based on max
		$qty = (int)$qty;
		$qty = min($qty, $max);
		$qty = max(0, $qty);

		// if said qty <= 0, nothing to do
		if ($qty <= 0) {
			return 0;
		}

		// else, attempt to give the award.
		$thing = array('name' => $c['thing'], 'quantity' => $qty);
		if (add_user_thing($thing, $user_id, $title, $url)) {
			// adjust the cap.
			$c['next_allowed'] = (int)$now + (int)$c['rate'];
		} else {
			// nothing awarded ... sad.
			$qty = 0;
		}

		return $qty;
	} // award_with_rate_limit()


	function award_with_inventory_cap($name, $quantity, $max = 0, $title = false, $url = false, $user_id = false) {

		if (!$user_id) {
			$user_id = get_user_id();
		}

		if ($max > 0) {
			if (!$user_id) {
				// we want to avoid relying on the award_q here, because the
				// user the ultimately signs in may not be able to receive the
				// awards we might promise.
				return false;

				// ... of course, if we can find a clever way to notify the
				// user upon login that they're unable to receive all of their
				// awards for reason X or whatever, that would be ideal.
				// because we DO want to entice NEW users if possible.

			} elseif (!$name) {
				return false;
			} else {
				$rows = select_user_things(array(
					'name' => $name, 'user_id' => $user_id
				), array('sql' => false));
				if (sizeof($rows) > 0) {
					$name_qty = $rows[0];
					if ($name_qty['quantity'] >= $max) {
						return false;
					}

					$max_awardable = $max - $name_qty['quantity'];
					$quantity = min($quantity, $max_awardable);

				}
			}
		} else {
			// no inventory cap. proceed. 
		}

		$thing = array(
			'name' => $name,
			'quantity' => $quantity
		);

		if(add_user_thing($thing, $user_id, $title, $url)) {
			return $quantity;
		} else {
			return 0;
		}
	} // award_with_inventory_cap()


	function drop_thing($thing, $place, $user = false) {
		if (!$user) {
			$user = authenticated_user();
			if (!$user) { 
				return false;
			}
		}

		$ok = my_start_transaction();

		if ($ok) {
			$thing['quantity'] = -1;
			$ok = add_user_thing($thing, $user['user_id']);
		}

		if ($ok) {
			$thing['quantity'] = 1;
			$ok = add_drop($place, $thing, 1);
		}

		if ($ok) {
			return my_commit();
		} else {
			my_rollback();
			return false;
		}
	} // drop_thing()



	//
	// IMAGES
	//

	function insert_image($image) {
		$row = array(
			'mimetype' => $image['mimetype'],
			'data' => base64_encode($image['data'])
		);
		return my_insert("images", $row);
	} // insert_image()


	function select_image($id) {
		$images = my_select("images", array('image_id' => $id));
		if (sizeof($images) > 0) {
			$images[0]['data'] = base64_decode($images[0]['data']);
			return $images[0];
		} else {
			return false;
		}
	} // select_image()


	function build_image_row($mimetype, $image_data, $width = 0, $height = 0, $pad = false, $mode = 'bounded') {
		if ($mimetype == 'image/svg+xml') {
			return array(
				'mimetype' => $mimetype,
				'data' => $image_data
			);
		}

		// list($w, $h, $t, $attr) = getimagesizefromstring($image_data);
		$original = imagecreatefromstring($image_data);
		$w = imagesx($original);
		$h = imagesy($original);
		if (($width == 0 && $height == 0) || ($width == $w && $height == $h)) {
			return array(
				'mimetype' => $mimetype,
				'data' => $image_data
			);
		} else {
			$m_aspect = $width/$height;
			$s_aspect = $w/$h;
			$resized = null;
			$destination_x = 0;
			$destination_y = 0;
			$canvas_width = $width;
			$canvas_height = $height;

			if ($mode == 'center') {
				$resized = imagecreatetruecolor($canvas_width, $canvas_height);
			}

			if ($mode == 'exact-width') {
				$height = floor(abs($width / $s_aspect));
			} else {
				// operate as though $mode == 'bounded'
				if ($s_aspect > $m_aspect) {
					$height = floor(abs($width / $s_aspect));
				} else {
					$width = $height * $s_aspect;
				}
			}

			if ($mode == 'center') {
				$destination_x = ($canvas_width - $width) / 2;
				$destination_y = ($canvas_height - $height) / 2;
			}

			if ($resized == null) {
				if ($pad) {
					$max_wh = max($width, $height);
					$resized = imagecreatetruecolor($max_wh, $max_wh);
				} else {
					$resized = imagecreatetruecolor($width, $height);
				}
			}

			imagealphablending($resized, false);
			imagesavealpha($resized, true);
			$transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
			imagefill($resized, 0, 0, $transparent);
			imagecopyresampled(
				$resized, $original,
				$destination_x, $destination_y, 0, 0,
				$width, $height, $w, $h
			);

			ob_start();
			imagepng($resized);
			$data = ob_get_contents();
			ob_end_clean();

			return array(
				'mimetype' => 'image/png',
				'data' => $data
			);
		}
	} // resize_image()


	//
	// ACTIONS
	//

	$action_fields = array(
		'action_id', 'name', 'icon_id', 'details'
	);

	function insert_action($action, $options = array()) {
		global $action_fields;
		$row = filtered_row($action, $action_fields);

		$ok = my_start_transaction();

		if ($ok) {
			$ok = my_insert("actions", $row);
		}

		if ($ok) {
			$id = $ok;
			$ok = save_action_things($action, $id);
		}

		if ($ok) {
			if(my_commit()) {
				return $id;
			} else {
				return false;
			}
		} else {
			my_rollback();
			return $ok;
		}
	} // insert_action()


	function update_action($action, $options = array()) {
		global $action_fields;
		$row = filtered_row($action, $action_fields);

		$ok = my_start_transaction();

		if ($ok) {
			$ok = my_update('actions', 'action_id', $row);
		}

		if ($ok) {
			$ok = save_action_things($action);
		}

		if ($ok) {
			return my_commit();
		} else {
			my_rollback();
			return $ok;
		}
	} // update_action()


	function save_action_things($action, $id = false) {
		$ok = my_start_transaction();

		if ($ok && isset($action['action_id']) && $action['action_id'] > 0) {
			$ok = delete_action_things(array(
				'action_id' => $action['action_id']
			));
		}

		if (is_array($action['products'])) {
			foreach ($action['products'] as $p) {
				if ($ok) {
					$p['action_id'] = $id ? $id : $action['action_id'];
					$ok = insert_action_thing($p);
				} else {
					break;
				}
			}
		}

		if (is_array($action['reagents'])) {
			foreach ($action['reagents'] as $r) {
				if ($ok) {
					$r['action_id'] = $id ? $id : $action['action_id'];
					$r['quantity'] = -1;
					$ok = insert_action_thing($r);
				} else {
					break;
				}
			}
		}

		if ($ok) {
			return my_commit();
		} else {
			my_rollback();
			return $ok;
		}
	} // save_action_things()


	function delete_action($action, $options = array()) {
		global $action_fields;
		throw new Exception("Not implemented.");
	} // delete_action()


	function select_actions($criteria, $options = array()) {
		global $action_fields;
		$c = filtered_row($criteria, $action_fields);
		return my_select("actions", $c);
	} // select_actions()



	//
	// ACTION THINGS
	// 

	$action_thing_fields = array(
		'action_thing_id', 'action_id', 'thing_id', 'quantity'
	);

	function select_action_things($action, $options = array()) {
		global $action_fields;
		$options['fields'] = "t.*, a_t.quantity";
		$row = filtered_row($action, $action_fields, 'a');
		return my_select("
				actions a
				left join action_things a_t on (a.action_id=a_t.action_id)
				left join things t on (t.thing_id=a_t.thing_id)
			",
			$row,
			$options
		);
	} // select_action_things()


	function select_thing_actions($thing, $options = array()) {
		global $thing_fields, $action_thing_fields;
		$options['fields'] = "a.*, a_t.quantity";
		$row = array_merge(
			filtered_row($thing, $thing_fields, 't1'),
			filtered_row($thing, $action_thing_fields, 'a_t')
		);
		$row['quantity<'] = 0;
		return my_select("
				things t1
				left join action_things a_t on (t1.thing_id=a_t.thing_id)
				left join actions a on (a.action_id=a_t.action_id)
			",
			$row,
			$options
		);
	} // select_thing_actions()


	function select_things_action($things) {
		global $thing_fields;
		$rv = array();

		foreach ($things as $t) {
			$row = filtered_row($t, $thing_fields);
			$row['quantity'] = -1;

			if (sizeof($rv) > 0) {
				$row['action_id'] = array_column($rv, 'action_id');
			}

			// $rv = my_select('action_things', $row);
			$rv = select_thing_actions($row);
			if (sizeof($rv) == 0) {
				break;
			}
		}

		if (sizeof($rv) > 0) {
			$rv = select_actions(array(
				'action_id' => array_column($rv, 'action_id')
			));
		}

		if (sizeof($rv) > 0) {
			$rv = $rv[0];
			$rv['reagents'] = array();
			$rv['products'] = array();

			$action_things = select_action_things($rv);
			foreach ($action_things as $a_t) {
				if ($a_t['quantity'] > 0) {
					$rv['products'][] = $a_t;
				} else {
					foreach ($things as $t) {
						$found = false;
						if ($t['thing_id'] == $a_t['thing_id']) {
							$found = true;
							$rv['reagents'][] = $a_t;
							break;
						}
					}
					if (!$found) {
						$rv = null;
						break;
					}
				}
			}
		}

		return sizeof($rv) > 0 ? $rv : null;
	} // select_things_action()


	function insert_action_thing($action_thing) {
		global $action_thing_fields;
		$id = get_thing_id($action_thing);
		$row = filtered_row($action_thing, $action_thing_fields);
		if ($id) {
			$row['thing_id'] = $id;
			return my_insert('action_things', $row);
		} else {
			return false;
		}
	} // insert_action_thing()


	function update_action_thing($action_thing) {
		global $action_thing_fields;
		$row = filtered_row($action_thing, $action_thing_fields);
		return my_update('action_things', 'action_thing_id', $row);
	} // update_action_thing()


	function delete_action_things($criteria) {
		global $action_thing_fields;
		$c = filtered_row($criteria, $action_thing_fields);
		return my_delete('action_things', $c);
	} // delete_action_things()


	function combine_things($things) {
		$ok = my_start_transaction();

		$action = null;
		if ($ok) {
			$action = select_things_action($things);
			$ok = $action;
		}

		if ($ok) {
			foreach ($things as $t) {
				if ($ok) {
					// TODO: use the quantity specified in the action.
					// ... for the forseeable future, ... it'll be 1.
					$ok = consume_thing($t, 1);
				}
			}
		}

		if ($ok) {
			foreach ($action['products'] as $p) {
				if ($ok) {
					$ok = award($p['name'], $p['quantity']);
				}
			}
		}

		if ($ok) {
			if(my_commit()) {
				return $action;
			} else {
				return "Internal error.";
			}
		} else {
			my_rollback();
			return $action;
		}

	} // combine_things()


	function consume_thing($thing, $qty = 1) {
		$ok = my_start_transaction();

		if ($ok) {
			$thing['quantity'] = abs($qty) * -1;

			// just try to "use" the thing first.
			$ok = use_thing($thing, $qty);

			if (!$ok) {
				// if that doesn't work, try to remove it from inventory
				// for use.
				$ok = add_user_thing($thing);
			}
		}

		if ($ok) {
			return my_commit();
		} else {
			my_rollback();
			return false;
		}
	} // consume_thing()


	function use_thing($thing, $qty = 1) {
		if (!isset($thing['place_id']) || $thing['place_id'] <= 0) {
			return false;
		}

		$ok = my_start_transaction();

		if ($ok) {
			$t = $thing;
			unset($t['quantity']);
			$things = select_place_things($t);
			if (sizeof($things) > 0) {
				$t = $things[0];
				if (
					($t['mode'] == 'spawn' || $t['mode'] == 'drop')
					&& $t['quantity'] >= $qty
				) {
					$t['quantity'] -= $qty;
					$ok = update_place_thing($t);
				} elseif ($t['mode'] == 'static') {
					// static items are not consumed.
					$ok = true;
				} else {
					$ok = false;
				}
			} else {
				$ok = false;
			}
		}

		if ($ok) {
			return my_commit();
		} else {
			my_rollback();
			return false;
		}
	} // use_thing()


	function pickup_thing($thing) {
		
	} // pickup_thing()


	//
	// CHALLENGES
	//

	function insert_challenge($challenge) {
		$row = array(
			'title' => normalize($challenge['title']),
			'details' => normalize($challenge['details']),
			'icon_id' => $challenge['icon_id'],
			'repeatable' => $challenge['repeatable'],
			'enabled' => isset($challenge['enabled']) ? (bool)$challenge['enabled'] : true
		);

		if (@$challenge['user_id']) {
			$row['user_id'] = @$challenge['user_id'];
		} else {
			$user = get_authenticated_user();
			$row['user_id'] = $user['user_id'];
		}

		try {
			// my_query("start transaction");
			my_start_transaction();

			$existing = select_challenges(array('title' => $row['title'], 'user_id' => $user['user_id'], 'enabled' => true));
			if (sizeof($existing) > 0) {
				// my_query("rollback");
				my_rollback();

				throw new Exception("Duplicate title. Change it or <a href='/edit-challenge?id={$existing[0]['challenge_id']}'>edit the existing one</a>.");
			}

			$rv = my_insert("challenges", $row);

			if (isset($challenge['things'])
				&& is_array($challenge['things'])) 
			{
				foreach ($challenge['things'] as $thing) {
					insert_challenge_thing(
						$rv,
						$thing
					);
				}
			}

			if (isset($challenge['actions'])
				&& is_array($challenge['actions']))
			{
				foreach ($challenge['actions'] as $action) {
					insert_challenge_action(
						$challenge['challenge_id'],
						$action
					);
				}
			}

			// my_query("commit");
			my_commit();

			return $rv;
		} catch (Exception $e) {
			// my_query("rollback");
			my_rollback();

			throw $e;
		}
	} // insert_challenge()


	function update_challenge($challenge) {
		$row = array(
			'challenge_id' => $challenge['challenge_id'],
			'title' => normalize($challenge['title']),
			'details' => normalize($challenge['details']),
			'icon_id' => $challenge['icon_id'],
			'repeatable' => $challenge['repeatable'],
			'enabled' => isset($challenge['enabled']) ? (bool)$challenge['enabled'] : true
		);

		// my_query("start transaction");
		my_start_transaction();

		$updated = my_update("challenges", 'challenge_id', $row);
		if ($updated) {
			if (isset($challenge['things'])
				&& is_array($challenge['things'])) 
			{
				delete_challenge_things($challenge['challenge_id']);

				foreach ($challenge['things'] as $thing) {
					if (!insert_challenge_thing(
						$challenge['challenge_id'],
						$thing
					)) {
						my_rollback();
						return false;
					}
				}
			}

			// my_query("commit");
			my_commit();

			return true;
		} else {
			// my_query("rollback");
			my_rollback();

			return false;
		}
	} // update_challenge()


	function delete_challenge($challenge_id) {
		// throw new Exception("Challenges may not be deleted.");
		$challenges = select_challenges(array('challenge_id' => $challenge_id));
		if (sizeof($challenges) > 0) {

			$ok = my_start_transaction();

			if ($ok) {
				$challenge = $challenges[0];
				$challenge['enabled'] = false;
				$ok = update_challenge($challenge);
			}

			if ($ok) {
				$id = (int)sanitize($challenge['challenge_id']);
				$zero = '0000-00-00 00:00:00';
				$ok = my_query("delete from user_challenge where challenge_id='{$id}' and completed='{$zero}'");
			}

			if ($ok) {
				$ok = my_commit();
			} else {
				my_rollback();
			}

			return (boolean)$ok;

		} else {
			throw new Exception("Challenge not found.");
		}
	} // delete_challenge()


	function insert_challenge_thing($challenge_id, $thing) {
		try {
			// my_query("start transaction");
			my_start_transaction();

			$thing['thing_id'] = get_thing_id($thing);

			if ($thing['quantity'] <> 0) {
				$row = array(
					'challenge_id' => $challenge_id,
					'thing_id' => $thing['thing_id'],
					'quantity' => $thing['quantity']
				);
				my_insert("challenge_thing", $row);
			}
			
			return my_commit();
		} catch (Exception $e) {
			my_rollback();
			return false;
		}
	} // insert_challenge_thing()


	function delete_challenge_things($challenge_id) {
		$challenge_id = (int)$challenge_id;
		return my_query("delete from challenge_thing where challenge_id='{$challenge_id}'");
	} // delete_challenge_things()


	function insert_challenge_action($challenge_id, $action) {
		try {
			// my_query("start transaction");
			my_start_transaction();

			if (@$action['action_id'] > 0) {
				$action_id = $action['action_id'];
			} else {
				$existing = select_actions(array(
					'name' => $action['name'],
					'page' => $action['page'] || '*'
				));

				if (sizeof($existing) > 0) {
					$action_id = $existing[0]['action_id'];
				} else {
					$action_id = insert_action($action);
				}
			}

			$row = array(
				'challenge_id' => $challenge_id,
				'action_id' => $action_id
			);
			my_insert("challenge_action", $row);
			
			// my_query("commit");
			my_commit();

			return true;
		} catch (Exception $e) {
			// my_query("rollback");
			my_rollback();

			return false;
		}
	} // insert_challenge_action()


	function select_challenges($criteria, $options = array()) {
		if (!isset($options['order'])) {
			$options['order'] = 'challenge_id asc';
		}
		return my_select("challenges", $criteria, $options);
	} // select_challenges()


	function insert_user_challenge($challenge_id, $user_id = false) {
		if (!$user_id) {
			$user_id = get_user_id();
		}

		$row = array(
			'user_id' => (int)$user_id,
			'challenge_id' => (int)$challenge_id
		);

		return my_insert('user_challenge', $row);
	} // insert_user_challenge()


	function accept_challenge($challenge_id, $user_id = false) {
		return insert_user_challenge($challenge_id, $user_id);
	} // accept_challenge()


	function delete_user_challenge($challenge_id, $user_id = false) {
		if (!$user_id) {
			$user_id = get_user_id();
		} else {
			$user_id = (int)$user_id;
		}

		$challenge_id = (int)$challenge_id;

		return my_query("delete from user_challenge where user_id='{$user_id}' and challenge_id='{$challenge_id}' and completed='0000-00-00 00:00:00'");
	} // delete_user_challenge()


	function remove_challenge($challenge_id, $user_id = false) {
		return delete_user_challenge($challenge_id, $user_id);
	} // remove_challenge()


	function abandon_challenge($challenge_id, $user_id = false) {
		return delete_user_challenge($challenge_id, $user_id);
	} // abandon_challenge()


	function select_user_challenges($criteria = array(), $options = array()) {
		$table = "user_challenge uc left join challenges c on (uc.challenge_id=c.challenge_id)";
		if (!is_array($criteria)) {
			$criteria = array();
		}

		if (isset($criteria['user_id']) && $criteria['user_id']) {
			$criteria['uc.user_id'] = $criteria['user_id'];
		} else {
			$criteria['uc.user_id'] = get_user_id();
		}

		return my_select($table, $criteria, $options);
	} // select_user_challenges()


	function select_challenge_status($challenge_id, $user_id = false) {
		$challenge_id = (int)$challenge_id;
		if (!$user_id) {
			$user_id = get_user_id();
		} else {
			$user_id = (int)$user_id;
		}

		// get the challenge
		$challenges = select_challenges(array(
			'challenge_id' => $challenge_id
		));
		if (sizeof($challenges) > 0) {
			$c = $challenges[0];
		} else {
			return false;
		}

		// make sure it's enabled and the user doesn't own it
		$rv = null;
		$withdrawn = false;
		if ($c['user_id'] == $user_id) {
			$rv = CHALLENGE_CANNOT_ACCEPT;
		} elseif ($c['enabled'] == false) {
			// return CHALLENGE_WITHDRAWN;
			$withdrawn = true;
		}

		// see whether the user has accepted it already
		/*
		$rows = my_select(
			'user_challenge', array(
			'challenge_id' => $challenge_id,
			'user_id' => $user_id
		));
		*/

		$query = "select * from user_challenge where challenge_id='{$challenge_id}' and user_id='{$user_id}' order by user_challenge_id desc limit 1";
		$result = my_query($query);
		if (!$result) {
			$rv = CHALLENGE_CANNOT_ACCEPT;
		}

		if ($rv == null && $row = my_fetch_assoc($result)) {
			// the user has accepted.
			// see whether the user has completed it
			if ($row['completed'] == '0000-00-00 00:00:00') {
				// user has accepted, but not completed
				$rv = CHALLENGE_ACCEPTED;
			} else {
				// user has completed.
				// see whether the challenge is repeatable
				if ($c['repeatable'] == '1') {
					$rv = CHALLENGE_REPEATABLE;
				} else {
					$rv = CHALLENGE_COMPLETED;
				}
			}
		} elseif ($rv == null && !$withdrawn) {
			// see whether the user has completed prerequisite challenges
			$rows = my_select("challenges c left join user_challenge uc on (uc.challenge_id=c.challenge_id and uc.user_id={$user_id} and uc.completed!=0)", array(
				'c.user_id' => $c['user_id'],
				'c.challenge_id <' => $challenge_id,
				'c.enabled' => 1
			));
			foreach ($rows as $row) {
				if ($row['user_challenge_id'] == ""
					// || $row['completed'] == '0000-00-00 00:00:00'
				) {
					$rv = CHALLENGE_HAS_PREREQUISITES;
				}
			}
	
			// should be OK to accept
			if ($rv == null) {
				$rv = CHALLENGE_NOT_ACCEPTED;
			}
		}

		if ($withdrawn) {
			if ($rv == CHALLENGE_ACCEPTED) {
				$rv = CHALLENGE_ACCEPTED_WITHDRAWN;
			} else {
				$rv = CHALLENGE_WITHDRAWN;
			}
		}

		return $rv;
	} // select_challenge_status()


	function is_challenge_accepted($challenge_id, $user_id = false) {
		$status = select_challenge_status($challenge_id, $user_id);
		if ($status == CHALLENGE_ACCEPTED) {
			return true;
		} else {
			return false;
		}
	} // is_challenge_accepted()


	function select_profile_challenges($profile_id = false) {
		if (!$profile_id) {
			$profile_id = get_user_id();
		} else {
			$profile_id = (int)$profile_id;
		}

		$user_id = get_user_id();

		if ($user_id == $profile_id) {
			$rows = select_challenges(array('user_id' => $profile_id, 'enabled' => true), array('order' => 'challenge_id asc'));
			foreach ($rows as $k => $v) {
				$rows[$k]['status'] = CHALLENGE_CANNOT_ACCEPT;
			}
		} else {
			$query = str_replace("\t", '', "select
				c.*,
				min(uc.completed) completed,
				max(uc.user_challenge_id) user_challenge_id,
				count(*) count
				from challenges c
				left join user_challenge uc
					on (uc.challenge_id=c.challenge_id
						and uc.user_id='{$user_id}')

				where
					c.user_id='{$profile_id}'
					and c.enabled=1

				group by
					c.challenge_id asc
			");
			if ($result = my_query($query)) {
				$first = true;
				$rows = array();
				while ($row = my_fetch_assoc($result)) {
					if ($row['completed'] == '0000-00-00 00:00:00') {
						$row['status'] = CHALLENGE_ACCEPTED;

						// only count this challenge against future challenge
						// acceptability if it has NOT been completed before.
						// i.e., if the group-count == 1.
						if ($row['count'] == 1) {
							$first = false;
						}
					} elseif ($row['enabled'] == false) {
						$row['status'] = CHALLENGE_WITHDRAWN;
					} elseif ($row['user_challenge_id'] == "") {
						if ($first) {
							$row['status'] = CHALLENGE_NOT_ACCEPTED;
						} else {
							$row['status'] = CHALLENGE_HAS_PREREQUISITES;
						}
						$first = false;
					} else {
						if ($row['repeatable'] == '1') {
							$row['status'] = CHALLENGE_REPEATABLE;
						} else {
							$row['status'] = CHALLENGE_COMPLETED;
						}
					}
					$rows[] = $row;
				}
			} else {
				// print "select profile challenges: " . $query;
			}
		}

		return $rows;
	} // select_profile_challenges()


	function select_random_challenge($user_id = false) {
		// exclude challenges the user created or has already accepted
		if (!$user_id) {
			$user_id = get_user_id();
		}

		//
		// use simple bounds checkings to pick our random ID
		//

		$user_id = sanitize($user_id);

		// max
		$query = "select max(challenge_id) challenge_id from challenges where user_id != {$user_id}";
		$result = my_query($query);
		$row = my_fetch_assoc($result);
		$max_id = $row['challenge_id'];

		// min
		$query = "select min(challenge_id) challenge_id from challenges where user_id != {$user_id}";
		$result = my_query($query);
		$row = my_fetch_assoc($result);
		$min_id = $row['challenge_id'];

		// random ID
		$challenge_id = rand($min_id, $max_id);

		$query = str_replace("\t", '', "select
			*

			from
				challenges c
				left join users u on (c.user_id=u.user_id)

			where
				c.user_id != {$user_id}
				and c.challenge_id >= {$challenge_id}
				and challenge_id not in (
					select challenge_id
					from user_challenge
					where user_id = {$user_id}
				)

			limit 1
		");

		if ($result = my_query($query)) {
			$base_challenge = my_fetch_assoc($result);

			// get the first challenge from the challenge's user that
			// the logged in user can actually complete.

			$challenges = select_profile_challenges($base_challenge['user_id']);
			foreach ($challenges as $c) {
				if ($c['status'] == CHALLENGE_NOT_ACCEPTED || $c['status'] == CHALLENGE_REPEATABLE) {
					return $c;
				}
			}
			
			return false;
		} else {
			return my_error();
		}
	} // select_random_challenge()


	function complete_challenge($challenge_id) {
		// my_query('start transaction');
		my_start_transaction();

		$user_id = (int)get_user_id();

		$challenges = select_challenges(array('challenge_id' => $challenge_id, 'enabled' => true));
		if (sizeof($challenges) > 0) {
			$c = $challenges[0];

			$turnins = select_user_turnins($challenge_id);
			$valid_turnin = true;
			foreach ($turnins as $t) {
				if ($t['user_quantity'] < $t['challenge_quantity']) {
					$valid_turnins = false;
					break;
				}
			}

			if ($valid_turnin) {
				insert_event(array(
					'user_id' => $user_id,
					'challenge_id' => $challenge_id
				), true);

				$challenge_things = select_challenge_things($challenge_id);
				foreach ($challenge_things as $t) {
					// not a very efficient way to do this ... improve later!
					add_user_thing($t);
				}
				my_query("update user_challenge set completed=now() where user_id='{$user_id}' and challenge_id='{$c['challenge_id']}'");
			} else {
				// my_query('rollback');
				my_rollback();

				return false;
			}
			
		} else {
			// my_query('rollback');
			my_rollback();

			return false;
		}

		// my_query('commit');
		my_commit();

	} // complete_challenge()


	function select_new_challenges($criteria = array(), $options = array()) {
		$omitted_user = get_user_id();
		if ($omitted_user) {
			$join_condition = "
				left join user_challenge uc	on (
					uc.challenge_id=c.challenge_id
					and uc.user_id='{$omitted_user}'
				)";
			$criteria['(uc.user_challenge_id is null)'] = '1'; // '0000-00-00 00:00:00';
			$criteria['c.user_id!='] = $omitted_user;
		} else {
			$join_condition = '';
		}

		if (isset($criteria['user_id'])) {
			$criteria['c.user_id'] = $criteria['user_id'];
			unset($criteria['user_id']);
		};

		$criteria['c.enabled'] = 1;

		if (!isset($options['limit'])) {
			// $options['limit'] = 5;
		}

		$options['order'] = 'challenge_id asc';
		$options['fields'] = "
			distinct c.user_id, c.*
		";

		$options['group'] = 'c.user_id';

		$options['sql'] = 0;

		return my_select("challenges c {$join_condition}",
			$criteria,
			$options
		);

	} // select_new_challenge()	


	//
	// COMMENTS
	//

	function insert_comment($channel, $message, $user_id = false) {
		if (!$user_id) {
			$user_id = get_user_id();
		}

		if (!$user_id) {
			return false;
		}

		$comment = array(
			'channel' => $channel,
			'message' => $message,
			'user_id' => (int)$user_id
		);
		return my_insert('comments', $comment);
	} // insert_comment()


	function update_comment($comment) {
		$row = array(
			'comment_id' => $comment['comment_id'],
			'channel' => $comment['channel'],
			'message' => normalize($comment['message']),
			'user_id' => $comment['user_id']
		);
		return my_update("comments", "comment_id", $row);
	} // update_comment()


	function delete_comment($comment_id) {
		$comment_id = (int)$comment_id;
		return my_query("delete from comments where comment_id='{$comment_id}'");
	} // delete_comment()


	function select_comments($criteria, $options = array()) {
		$options['columns'] = array(
			'c.*',
			'u.user_id',
			'u.name'
		);

		return my_select(
			'comments c left join users u on (u.user_id=c.user_id)',
			$criteria,
			$options
		);
	} // select_comments()


	function select_channel_comments($channel) {
		return select_comments(array('channel' => $channel));
	} // select_channel_comments()


	function select_comment_count($channel) {
		$channel = sanitize($channel);
		$query = "select count(*) count from comments where channel='{$channel}'";
		$rows = my_query($query);
		return $rows[0]['count'];
	} // select_comment_count()


	//
	// EVENTS
	//

	function insert_event($o, $set_parent_id = false) {
		global $parent_event_id, $meta_title, $html_title;

		$row = array(
			'user_id' => isset($o['user_id']) ? (int)$o['user_id'] : get_user_id(),
		);

		if (isset($o['challenge_id']) && $o['challenge_id']) {
			$row['challenge_id'] = (int)$o['challenge_id'];
		}
	
		if (isset($o['thing_id']) && $o['thing_id']) {
			$row['thing_id'] = (int)$o['thing_id'];
		}

		if (isset($o['quantity']) && $o['quantity']) {
			$row['quantity'] = (int)$o['quantity'];
		}

		if (isset($o['event_text']) && $o['event_text']) {
			$row['event_text'] = (int)$o['event_text'];
		}

		if (isset($o['parent_event_id']) && $o['parent_event_id']) {
			$row['parent_event_id'] = (int)$o['parent_event_id'];
		} else {
			$row['parent_event_id'] = $parent_event_id;
		}

		if (isset($o['url']) && $o['url']) {
			$row['url'] = $o['url'];
		} else {
			$row['url'] = $_SERVER['REQUEST_URI'];
		}

		if (isset($o['page_title']) && $o['page_title']) {
			$row['page_title'] = $o['page_title'];
		} else {
			if (isset($html_title) && $html_title) {
				$row['page_title'] = $html_title;
			} elseif (isset($meta_title) && $meta_title) {
				$row['page_title'] = $meta_title;
			}
		}

		$rv = my_insert('events', $row);

		if ($set_parent_id && $parent_event_id == 0) {
			$parent_event_id = $rv;
		}

		return $rv;
		
	} // insert_event()


	function select_events($criteria = array(), $options = array()) {
		$options['columns'] = array(
			'e.*', 'u.name', 't.name thing_name', 'c.title'
		);

		if (isset($criteria['user_id'])) {
			$criteria['e.user_id'] = $criteria['user_id'];
			unset($criteria['user_id']);
		}

		// $options['order'] = 'event_id desc';

		return my_select(
			'events e left join users u on (e.user_id=u.user_id) left join things t on (t.thing_id=e.thing_id) left join challenges c on (c.challenge_id=e.challenge_id)',
			$criteria,
			$options
		);
	} // select_events()


	function select_recent_events($criteria = array(), $options = array()) {

		if (isset($criteria['user_id'])) {
			$criteria['e.user_id'] = $criteria['user_id'];
			unset($criteria['user_id']);
		}

		if (isset($criteria['thing_id'])) {
			$criteria['e.thing_id'] = $criteria['thing_id'];
			unset($criteria['thing_id']);
		}

		$criteria['parent_event_id'] = 0;

		$sub_count = 10;
		if (isset($options['limit'])) {
			if (is_array($options['limit']) && $options['limit']['count']) {
				$sub_count = max((int)$options['limit']['count'], 10);
			} else {
				$sub_count = max((int)$options['limit'], 10);
			}
		}
		$sub_count = $sub_count * 10;

		$sub_options = array(
			'limit' => array('count' => $sub_count),
			'order' => 'event_id desc',
			'sql' => 1
		);

		$base = '(' . select_events($criteria, $sub_options) . ') bt';

		$_options = array(
			'columns' => 'max(event_id) event_id, parent_event_id, user_id, challenge_id, url, thing_id, sum(quantity) quantity, event_text, created, page_title, name, thing_name, title',
			'group' => 'parent_event_id, user_id, challenge_id, thing_id, event_text, page_title, name, thing_name, title',
			'limit' => isset($options['limit']) ? $options['limit'] : array('count' => 12),
			'order' => 'event_id desc',
			'sql' => isset($options['sql']) ? $options['sql'] : 0
		);

		foreach ($_options as $k => $v) {
			if (!isset($options[$k])) {
				$options[$k] = $v;
			}
		}

		$result = my_select(
			$base,
			array(),
			$options
		);

		if (!is_array($result)) {
			print $result;
			exit();
		}

		return array_reverse($result);

	} // select_recent_events()


	//
	// High Scores
	//

	function select_scores($criteria = array(), $options = array()) {
		if (!isset($criteria['game_id'])) {
			return false;
		}

		return my_select('scores', $criteria, $options);
	} // select_scores()

	function insert_score($score) {
		if (!isset($score['user_id']) && !isset($score['name'])) {
			return false;
		}

		if (!isset($score['score'])) {
			return false;
		}

		if (!isset($score['game_id'])) {
			return false;
		}

		$row = array(
			'game_id' => (int)$score['game_id'],
			'score' => $score['score']
		);

		if (isset($score['user_id'])) {
			$row['user_id'] = (int)$score['user_id'];
		} else {
			$row['name'] = $score['name'];
		}

		return my_insert('scores', $row);
	} // insert_score()


?>
