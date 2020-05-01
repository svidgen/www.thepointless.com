<?php

	$require_theme = 'php';

	send_cache_control_headers('+1 year');

	require_once('includes/auth.inc');
	require_once('includes/game-inserts.inc');
	require_once('includes/messaging.inc');
	require_once('vendor/svidgen/tg-php/lib/tg-api.php');


	// refresh any existing user session / keep it alive.
	get_authenticated_user();


	tg_api_start(
		// namespace
		'TPDC.API',

		// methods
		array(
			'echo' => 'tpdc_api_echo',
			'echoJSON' => 'tpdc_api_echo_json',
			'setStalking' => 'tpdc_api_set_stalking',
			'sendMessage' => 'tpdc_api_send_message',
			'getUnreadMessageCount' => 'tpdc_api_unread_messages_count',
			'receiveNewMessages' => 'tpdc_api_receive_new_messages',
			'markConversationRead' => 'tpdc_api_mark_conversation_read',
			'getAuthenticatedUser' => 'tpdc_api_get_authenticated_user',
			'getPlaces' => 'tpdc_api_get_places',
			'linkPlaces' => 'tpdc_api_link_places',
			'thingAction' => 'tpdc_api_thing_action',
			'getThings' => 'tpdc_api_get_things',
			'takeThing' => 'tpdc_api_take_thing',
			'setFavoriteThing' => 'tpdc_api_set_favorite_thing',
			'awardThing' => 'tpdc_api_award_thing',
			'awardThings' => 'tpdc_api_award_things',
			'inventoryTotalFor' => 'tpdc_api_inventory_total_for',
		),

		// pollable methods
		array(

			'receiveNewMessages_start' => array(
				'latency' => 0.5,
				'function' => 'tpdc_api_receive_new_messages'
			),

			'getUnreadMessageCount_start' => array(
				'latency' => 5.0,
				'function' => 'tpdc_api_unread_messages_count'
			)

		),

		// debug mode?
		false

	); // tg_api_start()



	function tpdc_api_echo($o) {
		return $o;
	}  // tpdc_api_echo();


	function tpdc_api_echo_json($o) {
		return json_encode($o);
	} // tpdc_api_echo_json()


	function tpdc_api_set_stalking($victim_id, $stalk = null) {
		$user = authenticated_user();
		if (!$user) {
			if ($stalk == null) {
				return array('rv' => false);
			} else {
				return array('tg-api-eval' => "TPDC.Notify(\"Hark!\", \"You must sign in to do that!\");");
			}
		}

		$ok = true;
		if ($stalk !== null) {
			if ($stalk) {
				$ok = insert_stalker($user, array('user_id' => $victim_id));
				send(
					array('user_id' => $victim_id),	// to
					array('user_id' => 0),			// from
					"[{$user['name']}](/profile?id={$user['user_id']}) is now stalking you."
				);
			} else {
				$ok = delete_stalker($user, array('user_id' => $victim_id));
			}
		}

		if (!$ok) {
			return array('error' => 'Error changing stalker status.');
		}

		$is_stalking = select_stalker_relationships(array(
			'stalker_id' => $user['user_id'],
			'victim_id' => $victim_id
		));

		if (sizeof($is_stalking) > 0) {
			return array('rv' => true);
		} else {
			return array('rv' => false);
		}
	} // tpdc_api_set_stalking()


	function tpdc_api_send_message($to, $body) {
		$from = authenticated_user();
		if (!$from) {
			return array('error' => 'Not authenticated.');
		}

		if ($id = send(array('user_id' => $to), $from, $body)) {
			return true;
		} else {
			return array('error' => 'Message could not be sent.', 'details' => my_error());
		}
	} // tpdc_api_send_message()


	function tpdc_api_unread_messages_count($current_count = null) {
		$user = authenticated_user();
		if (!$user) {
			return array(
				'error' => 'Not authenticated.',
				'tg-api-stop' => true
			);
		}

		$conversations = select_conversations($user);
		$count = 0;
		foreach ($conversations as $c) {
			$count += $c['unread'];
		}

		if ($current_count === null || (int)$count != (int)$current_count) {
			return array(
				'tg-api-alter-request' => array($count),
				'count' => $count
			);
		} else {
			return array();
		}

	} // tpdc_api_unread_messages_count()


	function tpdc_api_receive_new_messages($with_id, $after) {
		$user = authenticated_user();
		if (!$user) {
			return array(
				'error' => 'Not authenticated.',
				'tg-api-stop' => true
			);
		}

		$names = array(
			$user['user_id'] => $user['name']
		);

		$images = array(
			$user['user_id'] => user_image($user, 50)
		);

		$rv = array();

		$messages = select_messages_after(
			$user, array('user_id' => $with_id), $after
		);
		foreach ($messages as $m) {

			if (!isset($names[$m['from_id']])) {
				$fromuser = select_user(array('user_id' => $m['from_id']));
				$names[$m['from_id']] = $fromuser['name'];
				$images[$m['from_id']] = user_image($fromuser, 50);
			}

			$rv[] = array(
				'message-id' => $m['message_id'],
				'unread' => $m['unread'],
				'image' => $images[$m['from_id']],
				'name' => $names[$m['from_id']],
				'message' => htmlsafe($m['message'])
			);

			$after = max($after, (int)$m['message_id']);
		}

		$rv['tg-api-alter-request'] = array($with_id, $after);

		return $rv;
	} // tpdc_api_poll_conversation()


	function tpdc_api_mark_conversation_read($from_id, $max_id) {
		$to = authenticated_user();
		if (!$to) {
			return array(
				'error' => 'Not authenticated.'
			);
		}
		$from = array('user_id' => $from_id);
		return conversation_mark_read($to, $from, $max_id);
	} // tpdc_api_mark_read()


	function tpdc_api_get_authenticated_user() {
		$user = get_authenticated_user();
		if ($user) {
			return trim_user_fat($user);
		} else {
			return false;
		}
	} // tpdc_api_get_authenticated_user()


	function tpdc_api_get_places($name) {
		$rows = select_places(array(
			'name like' => '%' . $name . '%'
		),
		array(
			'limit' => 20,
			'order' => 'place_id desc',
			'sql' => 0
		));
		return $rows;
	} // tpdc_api_get_places()


	function tpdc_api_link_places($place_a, $place_b) {
		$ok = my_start_transaction();

		if ($ok) {
			$ok = can_link_to_place($place_a);
		}

		if ($ok) {
			$ok = can_link_to_place($place_b);
		}

		if ($ok) {
			$ok = link_places($place_a, $place_b);
		}

		if ($ok) {
			if (my_commit()) {
				return true;
			} else {
				return false;
			}
		} else {
			my_rollback();
			return false;
		}
	} // tpdc_api_link_places()


	function tpdc_api_get_things($query) {
		return select_things($query);
	} // tpdc_api_get_things()


	function tpdc_api_thing_action($things) {
		$user = authenticated_user();
		if (!$user) {
			return array("error" => "You aren't even signed in!");
		}

		$rv = combine_things($things);

		if ($rv === null) {
			$rv = array("error" => "These things cannot be combined.");
			if (is_admin()) {
				$thing_ids = array();
				foreach ($things as $t) {
					$thing_ids[] = $t['thing_id'];
				}
				$thing_ids = join(",", $thing_ids);
				$rv['edit'] = "/edit-action?things={$thing_ids}";
			}
		} elseif (is_string($rv)) {
			$rv = array("error" => $rv);
		}

		return $rv;
	} // tpdc_api_combine_things()


	function tpdc_api_take_thing($thing) {
		$user = authenticated_user();
		if (!$user) {
			return array(
				'error' => 'You must be signed in to take things!'
			);
		}

		$ok = my_start_transaction();

		if ($ok && $thing['place_id']) {
			$ok = consume_thing($thing);
		}


		// easier to do here, for now, than making award_and_notify
		// take a thing_id
		if ($ok) {
			$things = select_things(array('thing_id' => $thing['thing_id']));
			if (sizeof($things) > 0) {
				$thing['name'] = $things[0]['name'];
			}
		}

		if ($ok) {
			$thing['quantity'] = 1;

			// this isn't triggering the notification until the subsequent
			// page load.
			// $ok = award_and_notify($thing['name'], 1);
			$ok = award_with_inventory_cap(
				$thing['name'], 1, 0, false, "/place?id={$thing['place_id']}"
			);
		}

		if ($ok) {
			$ok = my_commit();
			if ($ok) {
				return true;
			} else {
				return false;
			}
		} else {
			my_rollback();
			return $ok;
		}
	} // tpdc_api_take_thing()


	function tpdc_api_set_favorite_thing($thing) {

	} // tpdc_api_set_favorite_thing()

	function tpdc_api_award_thing($award) {
		return award(
			$award['item'], $award['quantity']
		);
	} // tpdc_api_award_thing()

	function tpdc_api_award_things($awards) {
		$rv = array();
		foreach ($awards as $award) {
			$rv[] = tpdc_api_award_thing($award);
		}
		return $rv;
	} // tpdc_api_award_things()

	function tpdc_api_inventory_total_for($thing_name) {
		return get_inventory_quantity(array('name' => $thing_name));
	} // tpdc_api_my_inventory()

?>
