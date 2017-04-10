<?php

	$meta_title = "nowhere";

	if (!isset($_GET['id'])) {
		// redirect('/place?id=1');
		$place_id = 1;
	} else {
		$place_id = (int)$_GET['id'];
	}

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');
	require_once('includes/auth.inc');

	$place = select_place($place_id);
	if ($place != null) {
		$meta_title = $place['name'];

		print_place($place);

		if ($user = authenticated_user()) {
			// P% random inventory drop.
			// P should baseline at 5% and increase logarithmically relative
			// (or something) with respect to unique (or total?) inventory
			// items owned.

			$inventory = select_user_things(array('user_id' => $user['user_id']));
			$total_qty = 0;
			foreach ($inventory as $i) {
				$P = log($i['quantity']) / 100;
				$R = rand(0,1000000)/1000000;
				if ($R < $P) {
					if (drop_thing($i, $place, $user)) {
						tpdc_notify('You dropped something!', "But, as you fumble around in your bag, you're not quite sure what was. So, you move along.");
					}
					break;
				}
			}

		}
			
	} else {
		print "No place found.";
	}


	function print_place($p) {
		// index user_places
		global $user_places, $share_verb, $base_url;


		// defaults. subject to change if a user is signed in.

		$your_favorite = '';
		// $your_favorite = "<span title=\"Not currently your favorite place\">&#9734;</span>";

		/*
		$user = get_authenticated_user();
		if ($user) {
			if (isset($user['favorite_place_id']) && $user['favorite_place_id'] == $p['place_id']) {
				$your_favorite = "<span class='holy halo' title=\"Your current favorite place\">&#9733;</span>";
			}
		}
		*/

		enable_comments("?id={$p['place_id']}");
		$details = str_replace("\n", "<br />\n", $p['details']);

		if ($p['icon_id'] > 0) {
			$icon = "<img src='/d-image?id={$p['icon_id']}' class='distinct place-image' />";
			$js_icon = "{$base_url}d-image?id={$p['icon_id']}";
		} else {
			$icon = "";
			$js_icon = "";
		}

		if (is_admin()) {
			$edit_link = "| <a href='/edit-place?id={$p['place_id']}'>Edit</a>";
		} else {
			$edit_link = "";
		}


		// $things = select_place_things($p);
		// ... other processing ...
		$things = select_place_visible_things(array('place_id' => $p['place_id']));

		$things_markup = things_html($things, $p);
		$things_markup = $things_markup ? $things_markup : "Nothing ...";


		// $visitors = select_place_users($p);
		// ... other processing ... 
		$visitors_markup = '';


		$linked_places = select_linked_places($p);
		$lp_markup = array();
		foreach ($linked_places as $lp) {
			$lp_name = htmlsafe($lp['name']);
			$lp_markup[] = "<tpdc:linkedplace place_id=\"{$lp['place_id']}\" icon_id=\"{$lp['icon_id']}\" name=\"{$lp_name}\"></tpdc:linkedplace>";
		}

		if (is_admin() && sizeof($linked_places) < 4) {
			$token = add_token('addlinkedplace.' . (int)$p['place_id']);
			$lp_markup[] = "<tpdc:addlinkedplace place_id=\"{$p['place_id']}\" token=\"{$token}\"></tpdc:addlinkedplace>";
		}

		$lp_markup = join("\n", $lp_markup);

		//
		// at some point, these links/verbs will depend on whether a user
		// has one or more of the place, has recently been awarded a place,
		// and has recently shared the place.
		// 
		$share_link = "<a href='javascript:TPDC.FacebookPublish(default_share);' class='facebook'><span>Share this place</span></a>";


		$js_place_name = addslashes($p['name']);
		if (strlen($p['details']) < 100) {
			$js_description = json_encode($p['details']);
		} else {
			$js_description = json_encode(substr($p['details'], 0, 97)." ...");
		}

			// {$share_link}

		print "
			<div style='margin-bottom: 20pt;'>
				<div>{$your_favorite}
				{$edit_link}</div>
				<tpdc:placenavigation icon='{$js_icon}'>
					<div data-id='places'>{$lp_markup}</div>
				</tpdc:placenavigation>
				<div style='border: dashed #338833; border-width: 2px 0 2px 0; background-color: #f5fff5; padding: 5px; margin-top: 10px;'>{$details}</div>
				<div style='float: none; clear: right;'></div>
			</div>

			<div data-id='content'>
				<div><b>As you look around you see ... </b></div>

				<tpdc:things>
					<div data-id='things'>{$things_markup}</div>
				</tpdc:things>

				<tpdc:visitors>
						<div data-id='visitors'>{$visitors_markup}</div>
				</tpdc:visitors>

			</div>

			<script type='text/javascript'>
				var default_share = {
					name: \"{$js_place_name}\",
					source: \"{$js_icon}\",
					description: {$js_description},
					actions: [{
						name: \"Learn more\",
						link: document.location.href
					}]
				};
			</script>
		";
	} // print_challenge()


?>

