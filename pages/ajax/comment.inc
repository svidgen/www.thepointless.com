<?php

	require_once('includes/game.inc');
	$require_theme = 'jsonp';

	$user = get_authenticated_user();
	if (!$user) {
		return 1;
	}

	$json_debug = '';
	$json_reponse = '';

	$token = false;

	$json_debug .= $_GET['o'] . "\n";

	if (isset($_GET['o'])) {
		$o = json_decode($_GET['o'], 1);
	} else {
		$o = array();
	}

	$json_debug .= print_r($o, 1) . "\n";

	if (isset($o['t'])) {
		$token = normalize($o['t']);
		$authorization = get_token($token);
	}

	$json_debug .= "here.";

	//
	// TESTING
	/*
	$authorization = array(
		'action' => 'comment',
		'channels' => array(
			$o['c'], 'global'
		)
	);
	*/
	// TESTING
	//


	if (is_array($authorization) && $authorization['action'] == 'comment') {
		// so far so good. determine the channel the client is attempting
		// to attach to
		$channel = 'global';
		if (isset($o['c'])) {
			$channel = normalize($o['c']);
		}

		$json_debug .= "basic auth OK\n";

		// ... and whether they're authorized to do so
		if ($channel && in_array($channel, $authorization['channels'])) {
			$json_debug .= "channel auth OK\n";

			// looks good.
			// start building a response ...
			$jso = array();
			$jso['t'] = add_token($authorization);

			// find and normalize the submitted message, if there is one
			$message = false;
			if (isset($o['m'])) {
				$message = normalize($o['m']);
			}

			// post the message to the database, if supplied and not empty
			$inserted = null;
			if ($message) {
				$inserted = insert_comment($channel, $message);
				$json_response = json_encode($jso);
				$json_debug .= "message insert rv: {$inserted}\n";

			}

			//
			// fetch messages in the requested range
			//

			$criteria = array();
			$options = array();

			// negative pagesize indicates DESC sort
			$pagesize = -10;
			if (isset($o['s'])) {
				$pagesize = (int)$o['s'];
			}

			$options['limit'] = array('count' => abs($pagesize));

			if ($pagesize > 0) {
				$options['order'] = 'comment_id asc';
				$field = 'comment_id>=';
			} else {
				$options['order'] = 'comment_id desc';
				$field = 'comment_id<=';
			}


			// comment_id of 0 indicates max/min id, depending on sort
			$comment_id = 0;
			if (isset($o['id'])) {
				$comment_id = (int)$o['id'];
			}

			if ($comment_id == 0) {
				if ($pagesize < 0) {
					$query = "select max(comment_id) id from comments where channel='{$channel}'";
					if ($result = my_query($query)) {
						if ($last_comment = my_fetch_assoc($result)) {
							$comment_id = (int)$last_comment['id'];
						}
					}
				}
			}

			$json_debug .= "max(comment_id): {$comment_id}\n";

			$criteria['channel'] = $channel;
			$criteria[$field] = $comment_id;
			$json_debug .= print_r($criteria, true) . "\n";
			$json_debug .= print_r($options, true) . "\n";

			// $jso['comments'] = select_comments($criteria, $options);

			$comments = select_comments($criteria, $options);
			$jso['comments'] = array();
			foreach ($comments as $c) {
				$c['message'] = htmlsafe($c['message']);
				$jso['comments'][] = $c;
			}

			// return value
			$json_response = json_encode($jso);


			// if a comment was added, notify ~recent~ participants.
			// (those in the selected set of comments)
			$recent_comments = select_comments(
				array(
					'channel' => $channel
				),
				array(
					'limit' => 20,
					'order' => 'comment_id desc'
				)
			);
			if ($inserted) {
				require_once('includes/messaging.inc');

				$recipients = array();

				foreach ($recent_comments as $c) {
					$recipients[$c['user_id']] = true;
				}

				if (isset($o['n'])) {
					$more_tos = preg_split('/,/', $o['n']);
					foreach ($more_tos as $to_id) {
						$recipients[$to_id] = true;
					}
				}

				$tos = print_r($recipients, 1);
				foreach (array_keys($recipients) as $to) {
					if ($to != $user['user_id']) {
						send(
							array('user_id' => $to),
							array('user_id' => 0),
							"[{$user['name']}](/profile?id={$user['user_id']}) commented on [{$channel}]."
						);
					}
				}
			}


		} else {
			$json_response = "";
		}

	} else {
		$json_response = "";
	}

	unset($json_debug);

?>
