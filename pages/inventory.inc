<?php

	$meta_title = "things I have";

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	refresh_local_user();
	$user = authenticate();
	$user_id = $user['user_id'];
	$things = select_user_things(array('user_id' => $user_id));

	if (isset($_GET['star']) && isset($_GET['token'])) {
		if (get_token($_GET['token']) == 'set_star') {
			$user['favorite_thing_id'] = (int)$_GET['star'];
			update_user($user);
			refresh_local_user();
		}
	}

	$favorite_thing_id = isset($user['favorite_thing_id']) ? $user['favorite_thing_id'] : null;

	if (isset($_SESSION['new_things'])) {
		$highlight = $_SESSION['new_things'];
		unset($_SESSION['new_things']);
	} else {
		$highlight = null;
	}
	
	$tt = "<tpdc:things><div data-id='things'>";

	$tt .= things_html(
		$things,
		null,	// place
		$user,
		$favorite_thing_id
	);

	$favorite_thing = null;

	// skipping this loop, but leaving here temporarily, so we can quickly 
	// refer to it to see how stars behaved, were styled, etc.
	// TODO: remove after things_html/TPDC.Thing is properly replicating
	// all the necessary functionality.
	if (false && sizeof($things) > 0) {

		$star_key = add_token('set_star');

		foreach ($things as $t) {
			$highlight_css = "";

			if ($highlight && is_array($highlight)) {
				foreach ($highlight as $h) {
					if (strtolower($h) == strtolower($t['name'])) {
						$highlight_css = "background-color: #ffffd5;";
						break;
					}
				}
			}

			if ($t['icon_id']) {
				$icon = "<img src='/d-image?id={$t['icon_id']}&w=16&h=16' />";
				$t['img'] = $icon;
			} else {
				$icon = "";
				$t['img'] = '';
			}


			if ($t['thing_id'] == $favorite_thing_id) {
				$star = "<span class='holy halo'>&#9733;</span>";
				$favorite_thing = $t;
				$name = "<span class=''>{$t['name']}</span>";
			} else {
				$star = "<a style='color: #cccccc;' href='/inventory?star={$t['thing_id']}&token={$star_key}'>&#9734;</a>";
				$name = $t['name'];
			}

			$tt .= "<tr>
				<td>{$star}</td>
				<td style='width: 80%; {$highlight_css}'>
					<a href='/thing?id={$t['thing_id']}'>
						{$icon}
						{$name}
					</a>
				</td>
				<td style='{$highlight_css}'>
					{$t['quantity']}
				</td>
			</tr>\n";
		}
	} else {
		// $tt .= "<b>You don't have any things yet!</b>.\n";
	}

	$tt .= "</div></tpdc:things>\n";


	if ($favorite_thing) {
		$thing_name = htmlsafe($favorite_thing['name']);

		$larger_icon = '';
		if ($favorite_thing['img']) {
			$larger_icon = "<img src='/d-image?id={$favorite_thing['icon_id']}&w=48&h=48' class='distinct' />";
		}

		$favorite_thing_note = "<table class='gentle reminder'><tr>
			<td class='holy halo decoration'>
				&#9733;
			</td>
			<td>
				<div class='super-point'>Your current favorite thing: <a href='/thing?id={$favorite_thing['thing_id']}' class=''>{$thing_name}</a></div>
				<div class='de-emphasized sub-point'>
					Change your favorite by clicking another thing's star.
					<br />Having a favorite increases it's global value.
				</div>
			</td>
			<td class='decoration'>{$larger_icon}</td>
		</tr></table>";
	} else {
		$favorite_thing_note = "<table class='urgent notice'><tr>
			<td class='decoration'>
				&#9734;
			</td>
			<td>
				<div class='super-point'>You haven't selected a favorite thing.</div>
				<div class='de-emphasized sub-point'>
					Select one by clicking its star.
					<br />Selecting a favorite increases it's global value.
				</div>
			</td>
			<td class='decoration'>
				&#9734;
			</td>
		</tr></table>";
	}


	print /* $favorite_thing_note . */ $tt;


?>

