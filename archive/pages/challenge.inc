<?php

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	$html_checkmark = '&#x2714;';

	$share_link = "<a href='javascript:TPDC.FacebookPublish(default_share);' class='facebook'><span>Share</span></a>";
	$share_verb = "discovered";
	if (isset($_GET['id'])) {
		if (isset($_GET['action'])) {
			$action = get_token($_GET['action']);

			if ($action == "accept challenge") {
				accept_challenge($_GET['id']);
			} elseif ($action == "abandon challenge") {
				abandon_challenge($_GET['id']);
			} elseif ($action == "turnin challenge") {
				complete_challenge($_GET['id']);
				$share_link = "<a href='javascript:TPDC.FacebookPublish(default_share);' class='facebook'><span>Tout Your Success</span></a>";
				$share_verb = "completed";
			}
		}

		$challenges = select_challenges(array('challenge_id' => $_GET['id']));
		if (sizeof($challenges) > 0) {
			$c = $challenges[0];
			$c['status'] = select_challenge_status($c['challenge_id']);
			$c['things'] = select_challenge_things($c['challenge_id']);
			$c['challenger'] = select_user(array('user_id' => $c['user_id']));
			$user_things = select_user_turnins($c['challenge_id']);
			$meta_title = "quest #{$c['challenge_id']}";
			print_challenge($c);
		} else {
			challenge_not_found();
		}

	} else {
		challenge_not_found();
	}


	function challenge_not_found() {
		$meta_title = "I challenge you to a ...";
		print "... wait a minute. Nope. Nevermind.";
	} // challenge_not_found()


	function print_challenge($c) {
		// index user_things
		global $share_link, $share_verb, $base_url, $extra_meta_tags, $meta_description;

		enable_comments("?id={$c['challenge_id']}");


		$details = str_replace("\n", "<br />\n", $c['details']);
		$rewards = things_string(challenge_rewards($c), false);

		$turnins_a = challenge_turnins($c, 1);
		$fulfilled = 0;
		foreach ($turnins_a as $t) {
			$fulfilled += $t['fulfilled'];
		}
		$turnins = things_string($turnins_a, true);

		if ($c['icon_id'] > 0) {
			$icon = "<img src='/d-image?id={$c['icon_id']}' class='distinct' style='float: right;' />";
			$js_icon = "{$base_url}d-image?id={$c['icon_id']}&w=200&h=200&p=1";
		} else {
			$icon = "";
			$js_icon = "";
		}

		if ($c['repeatable']) {
			$repeatable = "<div style='margin-top: 20px;'>This challenge is <i>repeatable</i>.</div>";
		} else {
			$repeatable = "";
		}

		$txn_details = "
			<div style='margin-top: 20px;'><b>Turn-ins:</b> {$turnins}</div>
			<div><b>Rewards</b> {$rewards}</div>";

		$challenger = htmlsafe($c['challenger']['name']);
		$next_challenge = false;

		$user = authenticated_user();
		$user_id = $user['user_id'];
		if ($user_id) {
			if ($c['user_id'] == $user_id) {
				$share_link = "<a href='javascript:TPDC.FacebookPublish(default_share);' class='facebook'><span>Challenge Your Friends</span></a>";
				$share_verb = "challenges you to";
				$delete_key = add_token("delete-challenge");
				$edit_link = " - <a href='edit-challenge?id={$c['challenge_id']}' />Alter</a> | <a href='/delete-challenge?id={$c['challenge_id']}&amp;k={$delete_key}' onclick='return TPDC.confirm();'>Withdraw</a>";
				$accept_link = "";
				$reject_link = "";
			} else {
				$edit_link = "";

				if ($c['status'] == CHALLENGE_ACCEPTED) {
					if ($fulfilled == sizeof($turnins_a)) {
						$turnin_token = add_token("turnin challenge");
						$accept_link = "<tpdc:roughedge hover='green'><a class='block-link' href='challenge?id={$c['challenge_id']}&amp;action={$turnin_token}'>COMPLETE</a></tpdc:roughedge>";
					} else {
						// $accept_link = "<img src='/images/complete.png' title='You do not have all the turn-ins yet.' style='opacity: 0.35; filter: alpha(opacity=35);' />";
						$accept_link = "<div class='tpdc-roughedge opacity-35' title='You do not have all the turnins yet.'>Complete</div>";
					}

					$abandon_token = add_token("abandon challenge");
					// $accept_link = "<span style='color: green;'>Accepted</span>";
					// {$turnin_link}
					$reject_link = "<tpdc:roughedge hover='red'><a class='block-link' href='challenge?id={$c['challenge_id']}&amp;action={$abandon_token}'>ABANDON</a></tpdc:roughedge>";

				} elseif ($c['status'] == CHALLENGE_NOT_ACCEPTED) {
					$accept_token = add_token("accept challenge");
					$accept_link = "<tpdc:roughedge hover='green'><a class='block-link' href='challenge?id={$c['challenge_id']}&amp;action={$accept_token}'>ACCEPT</a></tpdc:roughedge>";
					$reject_link = "<tpdc:roughedge hover='red'><a class='block-link' href='profile?id={$c['user_id']}'>REJECT</a></tpdc:roughedge>";

				} elseif ($c['status'] == CHALLENGE_REPEATABLE) {
					$accept_token = add_token("accept challenge");
					$accept_link = "<tpdc:roughedge hover='blue'><a class='block-link' href='challenge?id={$c['challenge_id']}&amp;action={$accept_token}'>RE-ACCEPT</a></tpdc:roughedge>";
					$reject_link = "<tpdc:roughedge hover='yellow'><a class='block-link' href='profile?id={$c['user_id']}'>NO THANKS</a></tpdc:roughedge>";
					$details = "<span style='color: green;'>Thanks for your help!<br /><br />
						And whenever you feel like helping with this again, please do. I have plenty in stock to reward you with!</span>
					";
					$repeatable = '';
					$next_challenge = plug_next_user_challenge($c['user_id']);

				} elseif ($c['status'] == CHALLENGE_HAS_PREREQUISITES) {
					$accept_link = "This challenge has <a href='/profile?id={$c['user_id']}'>prerequisites</a>.";
					$reject_link = "";

				} elseif ($c['status'] == CHALLENGE_COMPLETED) {
					$accept_link = "<span style='color: gray;'>Challenge completed.</span>";
					$reject_link = '';
					$details = "<span style='color: green;'>Thanks for your help!</span>";
					$repeatable = '';
					$txn_details = '';
					$next_challenge = plug_next_user_challenge($c['user_id']);

				} elseif ($c['status'] == CHALLENGE_ACCEPTED_WITHDRAWN) {
					$abandon_token = add_token("abandon challenge");
					$accept_link = "<span style='color: #990000;'>This challenge has been withdrawn.</span>";
					$reject_link = "<tpdc:roughedge hover='red'><a class='block-link' href='challenge?id={$c['challenge_id']}&amp;action={$abandon_token}'>REMOVE</a></tpdc:roughedge>";
				} elseif ($c['status'] == CHALLENGE_WITHDRAWN) {
					$accept_link = "This challenge has been withdrawn.";
					$reject_link = '';
				} else {
					$accept_link = "You cannot accept this challenge right now.";
					$reject_link = '';
				}
			}
		} else {
			$edit_link = "";
			$return_url = urlencode($_SERVER['REQUEST_URI']);
			$accept_link = "<a href='signin?return={$return_url}'>Sign in</a> to accept the challenge.";
			$reject_link = '';
		}


		$js_title = addslashes($c['title']);
		$js_user_name = addslashes($user['name']);
		if (strlen($c['details']) < 200) {
			$js_description = json_encode($c['details']);
		} else {
			$js_description = json_encode(substr($c['details'], 0, 197) . " ...");
		}

		if (strlen($c['details']) < 200) {
			$meta_description = htmlsafe($c['details']);
		} else {
			$meta_description = htmlsafe(substr($c['details'], 0, 197)) . " ...";
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

		$title = htmlsafe($c['title']);

		print "

			<div>
				<h3>
					{$title}
					{$edit_link}
					&nbsp; &nbsp; {$share_link}
				</h3>
				{$icon}
				{$details}
			</div>

			{$txn_details}
			{$repeatable}

			<div style='margin-top: 40px;'>
				&mdash; <i><a href='/profile?id={$c['user_id']}'>{$challenger}</a></i>
			</div>

			<table style='clear: right; margin: 40px auto; text-align: center; font-size: large; width: 70%;'>
				<tr>
					<td>
						{$accept_link}
					</td>
					<td>
						{$reject_link}
					</td>
				</tr>
			</table>

			{$next_challenge}

			<script type='text/javascript'>
				var default_share = {
					name: \"{$js_user_name} {$share_verb} '{$js_title}'\",
					source: \"{$js_icon}\",
					description: {$js_description},
					actions: [{
						name: \"Accept this challenge\",
						link: document.location.href
					}]
				};
			</script>
		";
	} // print_challenge()


?>
