<?php

	$meta_title = "quest log";

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	$user = authenticate();
	$user_id = $user['user_id'];
	$open_challenges = select_user_challenges(array(
		'completed' => '0000-00-00 00:00:00'
	));
	$completed_challenges = select_user_challenges(
		array('completed >' => '0000-00-00 00:00:00'),
		array(
			'limit' => array('count' => 10),
			'order' => 'max(completed) desc',
			'group' => 'c.challenge_id'
		)
	);


	//
	// Challenges accepted
	//

	print "<h3>Workin' on it.</h3>";
	if (sizeof($open_challenges) > 0) {
		foreach ($open_challenges as $c) {
			$c['status'] = CHALLENGE_ACCEPTED;
			print challenge_box($c);
		}
	} else {
		print "You have not accepted any quests. ";
	}
	print "<a href='/news?q=1'>See what others are doing.</a>";



	//
	// Challenges completed
	//

	print "<h3>Done it.</h3>";
	if (sizeof($completed_challenges) > 0) {
		foreach ($completed_challenges as $c) {
			$c['status'] = CHALLENGE_COMPLETED;
			print challenge_box($c);
		}
	} else {
		print "You have not completed any challenges.";
	}



?>
