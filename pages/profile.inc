<?php

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	$meta_title = "player profile";

	$self = false;
	if (isset($_GET['id'])) {
		$user_id = (int)$_GET['id'];
		$signed_in_user = authenticated_user();
		if ($signed_in_user && $user_id == $signed_in_user['user_id']) {
			$self = true;
		}
	} else {
		$user_id = get_user_id();
		redirect("/profile?id={$user_id}");
		// $self = true;
	}

	if (!$user_id) {
		print "No player specified.";
		return 1;
	}

	enable_comments("?id={$user_id}", $user_id);

	$user = select_user(array('user_id' => $user_id));
	$userdata = json_decode($user['userdata'], 1);
	$challenges = select_profile_challenges($user_id);
	$events = select_recent_events(array('user_id' => $user_id));

	
	if ($self) {
		$edit_bio = " | <a href='/edit-profile'>Edit Profile</a>";
		$stalk = "";
	} else {
		$edit_bio = "";
	}

	print "<h3><i>{$user['name']}</i> {$edit_bio}</h3>";
	
	//
	// right side
	//
	// print "<div style='width: 270px; margin-left: 10px; float: right;'>";
	print events_html($events, 'Recent Activity', 'sidebar float-right');
	// print "</div>\n";


	//
	// left side
	//

	print "<div class='bio content'>\n";
	
	// icon
		print "<div class='bio_image'>" . user_image($user, 200) . "</div>";

	// bio
	if (is_array($userdata) && isset($userdata['bio']) && $userdata['bio']) {
		$bio = htmlsafe($userdata['bio']);
	} else {
		$bio = "<i>{$user['name']} has not written a bio.</i>";
	}
	print "<div class='bio_text'>"
		. str_replace("\n", "<br />", $bio)
		. "</div>\n";

	print "<div style='padding: 5px; text-align: center;''>
		<tpdc:stalklink victim=\"{$user_id}\"></tpdc:stalklink>
		<tpdc:roughedge hover='blue'><a class='block-link' href='/conversation?with={$user_id}'>Talk</a></tpdc:roughedge>
	</div>";
	print "</div><div style='float: none; clear: right;'></div>\n";


	//
	// foot
	//

	if (sizeof($challenges) > 0 || ($self && is_admin())) {
		print "<div style='float: right;'>" . challenge_color_key() . "</div>";
		print "<div class='tpdc-toggled-content'>
			<b data-id='content-title'>Quests available from <i>{$user['name']}</i></b>
			<div data-id='content'>
		";

		foreach ($challenges as $c) {
			print challenge_box($c);

			// only show up to ONE challenge that is listed as HAS_PREREQUISITES
			if ($c['status'] == CHALLENGE_HAS_PREREQUISITES) {
				break;
			}
		}


		if ($self && is_admin()) {
			if (sizeof($challenges) == 0) {
				print "You have not posed any challenges yet.";
			}

			if (sizeof($challenges) < 25) {
				print " <a href='/edit-challenge'>Hatch a quest!</a>";
			}
		}

		print "</div></div>";	// content, tpdc-toggled-content

	}



	//
	// "??? a quest."
	//
	// author, inscribe, compose, design, plan, create,
	// present, offer, pose, propose, forthput, architect, 
	// produce, beget, hatch, spawn, sire, submit
	//


?>
