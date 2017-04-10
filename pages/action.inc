<?php

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	$html_checkmark = '&#x2714;';

	if (isset($_GET['id'])) {
		if (isset($_GET['action'])) {
			$action = get_token($_GET['action']);
		}

		$actions = select_actions(array('action_id' => $_GET['id']));
		if (sizeof($actions) > 0) {
			$a = $actions[0];
			$a['status'] = select_action_status($a['action_id']);
			$a['things'] = select_action_things($a['action_id']);
			$a['actionr'] = select_user(array('user_id' => $a['user_id']));
			$user_things = select_user_turnins($a['action_id']);
			$meta_title = "quest #{$a['action_id']}";
			print_action($a);
		} else {
			action_not_found();
		}

	} else {
		action_not_found();
	}


	function action_not_found() {
		$meta_title = "Missing in action!";
	} // action_not_found()


	function print_action($a) {
		// index user_things
		global $base_url, $extra_meta_tags, $meta_description;

		enable_comments("?id={$a['action_id']}");

		$details = str_replace("\n", "<br />\n", $a['details']);

		$things = select_action_things($a);
		$reagents = array();
		$products = array();
		foreach ($things as $t) {
			if ($t['quantity'] > 0) {
				$products[] = $t;
			} elseif ($t['quantity'] < 0) {
				$reagents[] = $t;
			}
		}

		$reagents = things_string($reagents, true);
		$products = things_string($products, true);

		if ($a['icon_id'] > 0) {
			$icon = "<img src='/d-image?id={$a['icon_id']}' class='distinct' style='float: right;' />";
			$js_icon = "{$base_url}d-image?id={$a['icon_id']}";
		} else {
			$icon = "";
			$js_icon = "";
		}

		$txn_details = "
			<div style='margin-top: 20px;'><b>Reagents:</b> {$reagents}</div>
			<div><b>Products:</b> {$products}</div>";

		$js_title = addslashes($a['title']);
		$js_user_name = addslashes($user['name']);
		if (strlen($a['details']) < 200) {
			$js_description = json_encode($a['details']);
		} else {
			$js_description = json_encode(substr($a['details'], 0, 197) . " ...");
		}

		if (strlen($a['details']) < 200) {
			$meta_description = htmlsafe($a['details']);
		} else {
			$meta_description = htmlsafe(substr($a['details'], 0, 197)) . " ...";
		}

		$extra_meta_tags = "
			<meta property=\"og:title\" content=\"{$js_title}\" />
			<meta property=\"og:type\" content=\"article\" />
			<meta property=\"og:url\" content=\"{$_SERVER['SCRIPT_URI']}?id={$_GET['id']}\" />
			<meta property=\"og:image\" content=\"{$js_icon}\" />
			<meta property=\"og:site_name\" content=\"thepointless.com\" />
			<meta property=\"fb:admins\" content=\"8643372\" />
			<meta property=\"og:description\" content=\"{$meta_description}\" />
			";

		$title = htmlsafe($a['title']);

		print "

			<div>
				<h3>
					{$title}
					{$edit_link}
				</h3>
				{$icon}
				{$details}
			</div>

			{$txn_details}

		";
	} // print_action()


?>
