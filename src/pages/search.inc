<?php

	$meta_title = 'searching ... ';

	require_once('includes/game-inserts.inc');

	$q = isset($_GET['q']) ? trim($_GET['q']) : '';
	print search_html('', $q);

	if ($q) {

		$total_rows = 0;

		//
		// users
		//

		$rows = select_users(array(
			'name like' => '%' . $q . '%'
		),
		array(
			'limit' => 5,
			'order' => 'user_id desc',
			'sql' => 0
		));

		if (sizeof($rows) > 0) {
			$total_rows += sizeof($rows);
			// print "<div style='margin-top: 20px;'>People</div>";
			print "<h4>People</h4>";
			foreach ($rows as $user) {
				$userdata = json_decode($user['userdata'], 1);
				$image = user_image($user, 64);
				$url = '/profile?id=' . $user['user_id'];
				$details = ''; isset($userdata['bio']) ? $userdata['bio'] : '';
				$actions = "
					<tpdc:stalklink victim=\"{$user['user_id']}\"></tpdc:stalklink>
					<tpdc:roughedge hover='blue'>
						<a class='block-link' href='/conversation?with={$user['user_id']}'>Talk</a>
					</tpdc:roughedge>
				";
				print result_html($url, $user['name'], $details, $image, $actions);
			}
			print "<div style='border-bottom: 1px solid silver; margin-top: 20px;'></div>";
		} else {
			// print "<div style='margin: 20px;'><i>No people found.</i></div>";
		}


		//
		// things
		//

		$rows = select_things(array(
			'name like' => '%' . $q . '%'
		),
		array(
			'limit' => 5,
			'order' => 'thing_id desc',
			'sql' => 0
		));

		// print_r($rows); return 1;

		if (sizeof($rows) > 0) {
			$total_rows += sizeof($rows);
			print "<h4>Things</h4>";
			foreach ($rows as $thing) {
				$image = thing_image($thing, 64);
				$url = '/thing?id=' . $thing['thing_id'];
				print result_html(
					$url, $thing['name'], $thing['details'], $image
				);
			}
			print "<div style='border-bottom: 1px solid silver; margin-top: 20px;'></div>";
		} else {
			// print "<div style='margin: 20px;'><i>No <u>things</u> found.</i></div>";
		}


		//
		// places
		//

		$rows = select_places(array(
			'name like' => '%' . $q . '%'
		),
		array(
			'limit' => 5,
			'order' => 'place_id desc',
			'sql' => 0
		));

		// print_r($rows); return 1;

		if (sizeof($rows) > 0) {
			$total_rows += sizeof($rows);
			print "<h4>Places</h4>";
			foreach ($rows as $p) {
				$image = thing_image($p, 64);
				$url = '/place?id=' . $p['place_id'];
				print result_html(
					$url, $p['name'], $p['details'], $image
				);
			}
			print "<div style='border-bottom: 1px solid silver; margin-top: 20px;'></div>";
		} else {
			// print "<div style='margin: 20px;'><i>No <u>things</u> found.</i></div>";
		}


		if ($total_rows == 0) {
			print "<div style='margin: 20px;'>No matches.</div>";
		}

	}


?>
