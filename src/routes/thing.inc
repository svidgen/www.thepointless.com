<?php

	$meta_title = "a thing";

	if (!isset($_GET['id'])) {
		redirect('/index');
		return;
	}

	$thing_id = (int)$_GET['id'];

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');
	$things = select_things_with_stats(array('thing_id' => $thing_id));
	if (sizeof($things) > 0) {
		$thing = $things[0];
		if ($thing['enabled']) {
			print_thing($thing);
		} else {
			print "Thing not enabled.";
		}
	} else {
		print "No thing found.";
	}


	function print_thing($t) {
		// index user_things
		global $user_things, $share_verb, $base_url;


		// defaults. subject to change if a user is signed in.

		$your_favorite = '';
		// $your_favorite = "<span title=\"Not currently your favorite thing\">&#9734;</span>";

		$user = get_authenticated_user();
		if ($user) {
			if (isset($user['favorite_thing_id']) && $user['favorite_thing_id'] == $t['thing_id']) {
				$your_favorite = "<span class='holy halo' title=\"Your current favorite thing\">&#9733;</span>";
			}
			$your_ranking_header = "In comparison";
			$your_ranking = user_thing_ranking_html($t);
		} else {
			$your_ranking_header = "<a href=\"" . signin_url() . "\">Sign in</a> to see personal stats";
			$your_ranking = '';
		}

		$general_stats = thing_stats_html($t);
		$last_seen = thing_last_seen_html($t);

		enable_comments("?id={$t['thing_id']}");
		$details = str_replace("\n", "<br />\n", $t['details']);

		if ($t['icon_id'] > 0) {
			$icon = "<img src='/d-image?id={$t['icon_id']}' style='float: right;' class='distinct thing-icon' />";
			$js_icon = "{$base_url}d-image?id={$t['icon_id']}";
		} else {
			$icon = "";
			$js_icon = "";
		}


		if (is_admin()) {
			$edit_link = "| <a href='/edit-thing?id={$t['thing_id']}'>Edit</a>";
		} else {
			$edit_link = "";
		}


		//
		// at some point, these links/verbs will depend on whether a user
		// has one or more of the thing, has recently been awarded a thing,
		// and has recently shared the thing.
		// 
		$share_link = "<a href='javascript:TPDC.FacebookPublish(default_share);' class='facebook'><span>Share this thing</span></a>";


		$js_thing_name = addslashes($t['name']);
		if (strlen($t['details']) < 100) {
			$js_description = json_encode($t['details']);
		} else {
			$js_description = json_encode(substr($t['details'], 0, 97)." ...");
		}

		$rarity_class = strtolower($t['rarity']);

		print "
			<div>
				<span style='float: right;'>(Quality: <b class='{$rarity_class}'>{$t['rarity']}</b>)</span>
				<h3>{$t['name']}
				{$your_favorite}
				{$edit_link}
				</h3>
				{$icon}
				{$details}
				<div style='float: none; clear: right;'></div>
			</div>

			<div style='border-top: 1px solid #f0f0f0; clear: right; margin: 20px; padding: 20px 5px;'>

				<table style='width: 100%;'><tr>
					<td style='width: 45%; padding: 0px 10px 0px 0px; vertical-align: top;'>
						<b>{$your_ranking_header}</b>
						<div class='property-group'>
						{$your_ranking}
						</div>
					</td>

					<td style='padding-left: 20px; vertical-align: top;'>
					<!-- 
						<div><b>Attempt to </b></div>

						<tpdc:roughedge title=\"A relatively unskilled effort with a relatively low success rate. Requires a great deal of time.\" hover='green' class='box-1-of-2'>
							<a class='block-link' href='/harvest?id={$t['thing_id']}'>Harvest</a>
						</tpdc:roughedge>
					-->

						<!-- 
						<tpdc:roughedge hover='yellow' class='box-1-of-2'>
							<a class='block-link' href='/transmute?id={$t['thing_id']}'>Transmute</a>
						</tpdc:roughedge>

						<tpdc:roughedge hover='blue' class='box-1-of-2'>
							<a class='block-link' href='/conjure?id={$t['thing_id']}'>Conjure</a>
						</tpdc:roughedge>
						-->

					<!-- 

						<tpdc:roughedge title=\"Attempt to steal this item from another player. Requires a great deal of cunning and another player with the item.\" hover='red' class='box-1-of-2'>
							<a class='block-link' href='/steal?id={$t['thing_id']}'>Steal</a>
						</tpdc:roughedge>
					-->

					</td>

				</tr></table>

				<div class='tpdc-toggled-content' data-content-visible='1'>
					<b data-id='content-title'>Basic stats</b>
					<div class='property-group' data-id='content'>
					{$general_stats}
					</div>
				</div>

				<div class='tpdc-toggled-content' data-content-visible='1'>
					<b data-id='content-title'>Last seen</b>
					<div data-id='content'>{$last_seen}</div>
				</div>

			</div>

			<div style='margin-top: 40px; text-align: center; font-size: large; clear: right;'>
				{$share_link}
			</div>

			<script type='text/javascript'>
				var default_share = {
					name: \"{$js_thing_name}\",
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

