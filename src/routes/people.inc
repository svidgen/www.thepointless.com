<?php

	$meta_title = "my people";
	require_once('includes/game-inserts.inc');

	print "<tpdc:toggledcontent data-content-visible='1' style='display: block;'>";

	$stalkers = select_stalkers(authenticate());
	if (sizeof($stalkers) > 0) {
		$stalkers_text = sizeof($stalkers) == 1 ? 'stalker' : 'stalkers';

		print "<b data-id='content-title'>" . sizeof($stalkers) . " {$stalkers_text}</b>
		<div data-id='content'>
		";

		foreach ($stalkers as $s) {
			$userdata = json_decode($s['userdata'], 1);

			$bio = $userdata['bio'];
			if (strlen($bio) > 140) {
				$bio = substr($bio, 0, 140) . ' ...';
			}

			print result_html(
				'/profile?id=' . $s['user_id'],
				$s['name'],
				$bio,
				user_image($s, 64)
			);
		}
	} else {
		print "<div>No one is stalking you yet.</div>";
	}

	print "</div></tpdc:toggledcontent>";

	print "<tpdc:toggledcontent data-content-visible='true' style='display: block; margin-top: 30px;'>";

	$friends = select_victims(authenticate());
	if (sizeof($friends) > 0) {
		$victims_text = sizeof($friends) == 1 ? 'victim' : 'victims';

		print "<b data-id='content-title'>and <i>" . sizeof($friends) . "</i> {$victims_text}</b>
		<div data-id='content'>
		";

		foreach ($friends as $f) {
			$userdata = json_decode($f['userdata'], 1);

			$bio = $userdata['bio'];
			if (strlen($bio) > 140) {
				$bio = substr($bio, 0, 140) . ' ...';
			}

			print result_html(
				'/profile?id=' . $f['user_id'],
				$f['name'],
				$bio,
				user_image($f, 64)
			);
		}
	} else {
		print "<div>You're not stalking anyone yet.</div>";
	}

	print "</div></tpdc:toggledcontent>";

	print "<br />" . search_html();

?>
