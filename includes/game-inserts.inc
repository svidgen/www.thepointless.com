<?php

	require_once('includes/game.inc');


	function random_challenge_html($p = 1) {
		if ((rand(1, 100)/100) > $p) {
			return "";
		}

		if ($challenge = select_random_challenge()) {
			return challenge_box($challenge);
		}
	} // random_challenge_html()


	function plug_next_user_challenge($user_id) {
		$rv = "";
		$possibles = select_profile_challenges($user_id);
		foreach ($possibles as $p) {
			if ($p['status'] == CHALLENGE_NOT_ACCEPTED) {
				$title = htmlsafe($p['title']);
				$id = $p['challenge_id'];

				$preludes = array(
					"<b>Oh, and if you can spare the time,</b> I have one more thing I need help with ...",
					"<b>By the way,</b> could you help with one more thing?",
					"<b>So, as long as you're here,</b> I do have something else I need done."
				);
				$prelude = $preludes[array_rand($preludes)];

				$rv = "<div style='border: 1px solid #ddaaaa; padding: 5px; margin: 40px 20px;'>{$prelude}<br /><blockquote><a href='/challenge?id={$id}'>{$title}</a></blockquote></div>";
				break;
			}
		}
		return $rv;
	} // plug_next_user_challenge()


	function challenge_image_url($challenge, $size = 0, $pad = 0) {
		if ($size > 8) {
			$size = "&w={$size}&h={$size}";
		} else {
			$size = '';
		}
		return "/d-image?id={$challenge['icon_id']}{$size}&p={$pad}";
	} // challenge_image_url()


	function challenge_box($challenge) {
		if (!isset($challenge['things'])) {
			$challenge['things'] = select_challenge_things($challenge['challenge_id']);
		}

		$rewards = things_string(challenge_rewards($challenge),	1, 1);

		if (trim($rewards) == '') { $rewards = "None"; }
		if ($challenge['icon_id'] > 0) {
			$icon = "<td style='width: 52px;'>
				<a href='/challenge?id={$challenge['challenge_id']}'>
					<img class='challenge_box_icon' src='/d-image?id={$challenge['icon_id']}&w=48&h=48' />
				</a>
			</td>";
		} else {
			$icon = "";
		}

		$status = '';
		$css_class = 'challenge_box';
		if (isset($challenge['status'])) {
			switch ($challenge['status']) {
				case CHALLENGE_ACCEPTED:
					$turnins = challenge_turnins($challenge, 1);
					$fulfilled = 0;
					foreach ($turnins as $t) {
						$fulfilled += $t['fulfilled'];
					}

					if ($fulfilled == sizeof($turnins)) {
						$status .= "Challenge accepted and ready to complete.";
						$css_class .= " challenge_completable";
					} else {
						$status .= "Challenge accepted.";
						$css_class .= " challenge_accepted";
					}

					break;

				case CHALLENGE_HAS_PREREQUISITES:
					$status .= "This challenge has prerequisites.";
					$css_class .= " challenge_cannot_accept";
					break;

				case CHALLENGE_CANNOT_ACCEPT:
					$status .= "You cannot accept this challenge.";
					$css_class .= " challenge_cannot_accept";
					break;

				case CHALLENGE_COMPLETED:
					$status .= "You have completed this challenge.";
					$css_class .= " challenge_completed";
					break;

				case CHALLENGE_REPEATABLE:
					$status .= "This challenge is repeatable.";
					$css_class .= " challenge_repeatable";
					break;

				case CHALLENGE_WITHDRAWN:
					$status .= "This challenge has been withdrawn.";
					$css_class .= " challenge_withdrawn";
					break;

				default:
					break;
			}
		} else {
			// $status = "no status.";
		}

		// <a href='/profile?id={$challenge['user_id']}'>{$challenge['name']}</a>
		if ($status) {
			$status = "<div>{$status}</div>";
		}

		$title = htmlsafe($challenge['title']);

		return "<table class='{$css_class}'><tr>
			{$icon}
			<td>
				<b><a href='/challenge?id={$challenge['challenge_id']}' style='color: black;'>{$challenge['title']}</a></b>
				<br />Rewards 
				<i>{$rewards}</i>
			</td>
		</tr>
		</table>
		";
	} // challenge_box()


	//
	// things_string(things array, include_image boolean, abs_val boolean)
	//
	function things_string($things, $abs = false, $image = true, $linkify = true) {
		$rv = array();

		if (is_array($things)) {
			foreach ($things as $t) {

				$qty = $t['quantity'];
				if ($abs) {
					$qty = abs($qty);
				}

				$icon = '';
				if ($image && $t['icon_id']) {
					$icon = "<img src='/d-image?id={$t['icon_id']}&amp;w=16&amp;h=16' /> ";
				}

				if ($linkify && isset($t['thing_id']) && $t['thing_id'] > 0) {
					$link_open = "<a href=\"thing?id={$t['thing_id']}\">";
					$link_close = "</a>";
				} else {
					$link_open = '';
					$link_close = '';
				}

				if (isset($t['fulfilled']) && $t['fulfilled']) {
					$ts = "{$link_open}{$icon}<span style='color: green;'>{$qty} {$t['name']} ✓</span>{$link_close}";
				} else {
					$ts = "{$link_open}{$icon}{$qty} {$t['name']}{$link_close}";
				}

				$rv[] = $ts;
			}
		}

		return join(", ", $rv);
	} // things_string()


	//
	// things_array(string, negative bool) : array
	// accepts a string and attempts to return a qty-thing array
	//
	function things_array($s, $negate = false) {
		$rv = array();
		$ts_a = preg_split('/[,;|] */', $s);
		foreach ($ts_a as $ts) {
			if (preg_match('/^([0-9]+)( x)? +(.*)$/i', $ts, $m)) {
				$name = $m[3];
				$qty = $m[1];

				if ($negate) {
					$qty = $qty * -1;
				}

				if ($qty <> 0) {
					$rv[] = array(
						'name' => $name,
						'quantity' => $qty
					);
				}
			}
		}
		return $rv;
	} // things_array


	function thing_stats_html($thing) {
		if (!$thing) {
			throw new Exception('No thing given.');
		}

		if (isset($thing['rarity'])) {
			$t = $thing;
		} else {
			$rows = select_things_with_stats(array('thing_id' => $thing['thing_id']));
			if (sizeof($rows) > 0) {
				$t = $rows[0];
			} else {
				throw new Exception("Thing not found.");
			}
		}

		
		$t['rarity_percent'] = number_format(
			(float)$t['rarity_value'] * 100, 2
		);

		$t['rarity_class'] = strtolower($t['rarity']);

		$rv = property_list(array(
			"Total in circulation" => $t['total_owned'],
			"The most anyone has" => $t['most_owned'],
			"The average" => number_format($t['average_owned'], 2),
			"Folks who have at least one" => $t['users_owning'],
			"Its prevalence" => "<span title=\"{$t['rarity_percent']}% of users have one or more.\" class='{$t['rarity_class']} rarity'>{$t['rarity']}</span>"
		), '', 'width: 100%;');

		return $rv;

	} // thing_stats_html()


	function user_thing_ranking_html($thing, $user = false) {
		if (!$user) {
			$user = authenticate();
		}

		$stats = select_user_thing_stats(
			array(
				'user_id' => $user['user_id'],
				'thing_id' => $thing['thing_id']
			),
			array(
				'fields' => 'u.user_id, u.name, quantity'
			)
		);

		$board = array();

		if (sizeof($stats['users_with_more']) > 0) {
			foreach ($stats['users_with_more'] as $v) {
				$k = '<i>' . htmlsafe($v['name']) . '</i> has';
				$board[$k] = $v['quantity'];
			}
		} else {
			$board['<i class="de-emphasized">No one has more than you.</i>'] = '';
		}
		$board['<b><i>You</i> have</b>'] = '<b>' . (int)$stats['quantity'] . '</b>';

		if (sizeof($stats['users_with_less']) > 0) {
			foreach ($stats['users_with_less'] as $v) {
				$k = '<i>' . htmlsafe($v['name']) . '</i> has';
				$board[$k] = $v['quantity'];
			}
		}

		// print "<pre>" . print_r($stats, 1) . "</pre>";

		$board = property_list($board, '', 'width: 100%;');

		return $board;
	} // user_thing_stats_html()


	function thing_last_seen_html($thing) {
		$events = select_events(
			array('t.thing_id' => $thing['thing_id'], 'quantity>' => 0),
			array(
				'limit' => 5,
				'order' => 'event_id desc',
				'group' => 'user_id, challenge_id, page_title'
			)
		);

		foreach ($events as $k => $v) {
			if (isset($v['parent_event_id']) && $v['parent_event_id'] > 0) {
				$rows = select_events(
					array('event_id' => $v['parent_event_id']),
					array('limit' => 1)
				);
				$events[$k] = $rows[0];
			}
		}

		$name = htmlsafe($thing['name']);

		if (sizeof($events) == 0) {
			$events = array(array(
				'event_text' =>
					" ... nowhere. It isn't found in the wild."
			));
		}

		return events_html($events, '', 'events-medium', 'event-medium', 'event-medium');
	} // thing_last_seen_html()


	function action_products($action) {
		return challenge_rewards($action);
	} // action_rewards()


	function action_reagents($action) {
		return challenge_turnins($action);
	} // action_turnins()


	function challenge_rewards($challenge) {
		$rv = array();
		foreach ($challenge['things'] as $t) {
			if ($t['quantity'] > 0) {
				$rv[] = $t;
			}
		}
		return $rv;
	} // challenge_rewards()


	function challenge_turnins($challenge, $highlight = false) {
		$rv = array();

		if ($highlight) {
			$user_things = select_user_turnins($challenge['challenge_id']);
			$ut_index = array();
			foreach ($user_things as $thing) {
				$ut_index[$thing['thing_id']] = (int)$thing['user_quantity'];
			}
		}

		foreach ($challenge['things'] as $t) {
			if ($t['quantity'] < 0) {
				if ($highlight && isset($ut_index[$t['thing_id']])
					&& $ut_index[$t['thing_id']] >= abs($t['quantity']))
				{
					$t['fulfilled'] = 1;
				} else {
					$t['fulfilled'] = 0;
				}
				$rv[] = $t;
			}
		}


		return $rv;
	} // challenge_turnins()


	function tpdc_notify($title, $message) {
		if (!isset($_SESSION['notifications'])) {
			$_SESSION['notifications'] = array();
		}
		array_push($_SESSION['notifications'], array($title, $message));
	} // tpdc_notify()


	function tpdc_notifications_js() {
		$rv = array();

		if (isset($_SESSION['notifications'])) {
			$rv[] = "__tpdcq = window['__tpdcq'] || [];";

			foreach ($_SESSION['notifications'] as $n) {
				$t = json_encode($n[0]);
				$m = json_encode($n[1]);
				$rv[] = "__tpdcq.push(function() { TPDC.Notify({$t}, {$m})});";
			}

			$_SESSION['notifications'] = array();
		}

		return join($rv, "\n");

	} // get_tpdc_notifications()


	function tpdc_notification($title, $message) {
		return tpdc_notify($title, $message);
	} // tpdc_notification()


	function award_and_notify($name, $quantity, $max_inventory_quantity = 0, $url = false) {
		$display_name = htmlsafe($name);
		$quantity = (int)$quantity;

		if ($awarded = award_with_inventory_cap($name, $quantity, $max_inventory_quantity, false, $url)) {
			if (get_user_id()) {
				tpdc_notify("Hooray!", "You have received {$awarded} {$display_name}!");
				if (!isset($_SESSION['new_things']) || !is_array($_SESSION['new_things'])) {
					$_SESSION['new_things'] = array();
				}
				$_SESSION['new_things'][] = $name;
				return true;
			} else {
				tpdc_notify("Sign in", "to collect {$awarded} {$display_name}!");
				return true;
			}
		} else {
			// do nothing.
			return false;
		}
	} // award()


	function unique_award_and_notify($name, $quantity) {
		// like award_and_notify, but only if the user doesn't already have the item.
		// in other words, with award_and_notify() wherein the third paramter is 1.
		return award_and_notify($name, $quantity, 1);
	} // unique_award_and_notify()


	function challenge_color_key() {
		return "<span class='tool' style='font-size: 10px;'><b>* Color Key</b>
			<div class='tip' style='background-color: white; border: 1px solid silver; width: 175px; text-align: center;'>
				<div class='challenge_accepted padded spaced'>Accepted</div>
				<div class='challenge_completed padded spaced'>Completed</div>
				<div class='challenge_repeatable padded spaced'>Repeatable</div>
				<div class='challenge_cannot_accept padded spaced'>Cannot Accept</div>
				<div class='challenge_withdrawn padded spaced'>Withdrawn</div>
			</div>
		</span>";
	} // challenge_color_key()


	function enable_comments($c = false, $notify = false) {
		global $comments_channel, $comments_notify;
		$comments_channel = $c;
		if ($notify) {
			if (!is_array($notify)) {
				$notify = array((int)$notify);
			} elseif (isset($notify['user_id'])) {
				$notify = array($notify['user_id']);	
			}
			$comments_notify = $notify;
		}
	} // comments_channel()


	function comments_html($channel_override = false, $options = array(), $page_override = false, $notify_users = array()) {
		global $comments_channel, $comments_notify;

		if($channel_override) {
			$c = $channel_override;
		} elseif (isset($comments_channel)) {
			$c = $comments_channel;
		} else {
			$c = false;
		}

		if ($c) {
			if ($page_override) {
				$channel = $page_override;
			} else {
				$channel = $_SERVER['SCRIPT_NAME'];
			}

			if ($c) {
				if (is_array($c)) {
					$c = '?' . http_build_query($c);
				}
				$channel .= $c;
			}

			$option_pairs = array();
			foreach ($options as $k => $v) {
				$option_pairs[] = htmlsafe($k) . '="' . htmlsafe($v) . '"';
			}
			$options_attributes = join(' ', $option_pairs);

			if ($comments_notify) {
				$notify_ids = $comments_notify;
			} else {
				$notify_ids = array();
			}
			foreach ($notify_users as $user) {
				if (isset($user['user_id']) && (int)$user['user_id'] > 0) {
					$notify_ids[] = (int)$user['user_id'];
				}
			}
			$notify_string = join(',', $notify_ids);

			$authorization = array(
				'action' => 'comment',
				'channels' => array($channel)
			);

			$token = add_token($authorization);

			return "<tpdc:comments token=\"{$token}\" channel=\"{$channel}\" notify=\"{$notify_string}\" {$options_attributes}></tpdc:comments>";
		} else {
			return "";
		}
	} // comments_html()


	function event_html($e, $c = 'event') {
		$rv = array();
		$menu = array();

		$rv[] = "<div class='{$c}'><table><tr>";

		if (@$e['event_id'] && !@$e['parent_event_id']) {
			$menu[] = "<a href=\"/event?id={$e['event_id']}\" class='event-link'>#</a>";
		}

		$image_url = '/images/big_giant.png';
		$comments = '';
		if (@$e['event_id']) {
			if (!@$e['parent_event_id'] && ($c == 'event-big' || $c == 'event-medium')) {
				$rows = select_users(array('user_id' => $e['user_id']));
				if (sizeof($rows) > 0) {
					$user = $rows[0];
				} else {        
					$user = false;  
				}   
				$rv[] = "<td class='event-icon-td'>" . user_image($user, 50) . "</td>";


				if ($c == 'event-big') {
					$comment_options = array('autoload' => 20);
				} else {
					$comment_options = array();
				}
				$comment_options['class'] = 'event-comments';

				$user_id = (int)@$e['user_id'];
				$thing_id = (int)@$e['thing_id'];
				$page_title = urlencode(@$e['page_title']);
				$challenge_id = (int)@$e['challenge_id'];

				if ($c == 'event-big') {
					if ($challenge_id) {
						$rows = select_challenges(array(
							'challenge_id' => $challenge_id
						));
						$image_url = challenge_image_url($rows[0], 200, 1);
					} elseif ($thing_id) {
						$rows = select_things(array('thing_id' => $thing_id));
						$image_url = thing_image_url($rows[0], 200, 1);
					}
				}

				$comments = comments_html(
					"?u={$user_id}&t={$thing_id}&p={$page_title}&c={$challenge_id}",
					$comment_options,
					'/event',
					array($user)
				);
			}
		}

		$rv[] = "<td>";

		$action_text = '';
		if (@$e['parent_event_id']) {
			// $rv[] = "&rarr;";
			$rv[] = "&#x21b3";
		} elseif (@$e['user_id'] && @$e['name']) {
			$action_text .= $e['name'] . ' ';
			$rv[] = "<a class='event-username' href=\"/profile?id={$e['user_id']}\">{$e['name']}</a>";
		} else {
			$action_text .= 'an anonymous visitor ';
			$rv[] = "<b>an anonymous visitor</b>";
		}

		if (@$e['challenge_id']) {
			$rv[] = "completed";
			$rv[] = "<a href=\"/challenge?id={$e['challenge_id']}\">{$e['title']}</a>";
			$action_text .= "completed {$e['title']}";
		}
		
		if (@$e['thing_id'] && @$e['quantity']) {
			if ($e['challenge_id']) {
				$rv[] = "and";
			}

			if ($e['quantity'] > 0) {
				$action_text .= "received";
				$rv[] = 'received';
			} else {
				$action_text .= "lost";
				$rv[] = 'lost';
			}
			$action_text .= ' ' . abs($e['quantity']);

			$rv[] = abs($e['quantity']);
			$rv[] = "<a href=\"/thing?id={$e['thing_id']}\">{$e['thing_name']}</a>";
			$action_text .= ' ' . $e['thing_name'];
		}

		if (@$e['event_text']) {
			$action_text .= "{$e['event_text']}";
			$rv[] = $e['event_text'];
		}

		if (!@$e['challenge_id'] && @$e['page_title']) {
			$rv[] = "on <a href=\"{$e['url']}\">{$e['page_title']}</a>";
		}

		if (isset($e['event_id'])
			&& (!isset($e['child_events']) || !is_array($e['child_events']))
		) {
			$e['child_events'] = select_events(array(
				'parent_event_id' => $e['event_id']
			));
		}

		if (isset($e['child_events'])) {
			foreach ($e['child_events'] as $child) {
				$rv[] = event_html($child);
			}
		}

		$rv[] = $comments;

		if (sizeof($menu) > 0) {
			$rv[] = "<div class='event-menu'>" . join(' ', $menu) . "</div>";
		}

		$rv[] = "</td></tr></table></div>";

		if (!@$e['parent_event_id']) {
			global $base_url, $extra_meta_tags;
			$extra_meta_tags = $extra_meta_tags ? $extra_meta_tags : join("\n",
				array(
					og_tag('og:url', "{$base_url}event?id={$e['event_id']}"),
					og_tag('og:title', $e['page_title']),
					og_tag('og:description', $action_text),
					og_tag('og:image', "{$base_url}{$image_url}"),
					og_tag('og:type', 'article')
				)
			);
		}

		return join(' ', $rv);
	} // event_html()


	function events_html(
		$events,
		$title = "<u>Recent Activity</u>",
		$class = "events",
		$a_class = "event",
		$b_class = "event_alt"
	) {
		$rv = array();
		$rv[] = "<div class='{$class}'>{$title}";

		$parent_id = 0;
		$c = $b_class;
		foreach ($events as &$e) {
			if ($e['event_text']) {
				$rv[] = event_html($e, $c) . "\n";
			} else {
				if ($c == $a_class) {
					$c = $b_class;
				} else {
					$c = $a_class;
				}
				$rv[] = event_html($e, $c) . "\n";
			}
		}

		$rv[] = "</div>";
		return join(' ', $rv);
	} // events_html()


	function property_list($properties, $table_class='', $table_style='') {
		$rv = "<table class='propertylist {$table_class}' style=\"{$table_style}\">";

		$tr_class = 'a';
		foreach ($properties as $k => $v) {
			$k = $k;
			$v = $v;

			$rv .= "
				<tr class=\"{$tr_class}\">
					<td>{$k}</td>
					<td>{$v}</td>
				</tr>
			";
			
			if ($tr_class == 'a') {
				$tr_class = 'b';
			} else {
				$tr_class = 'a';
			}
		}

		return $rv . '</table>';
	} // property_list()


	function user_image($user, $size = 0) {
		$size = (int)$size;

		$rv = "<img src='/images/big_giant.png' style='vertical-align: top; width: {$size}px; height: {$size}px;' />";
		if (!$user) {
			return $rv;
		}
		
		if (preg_match("/^http(s)?:\/\/graph.facebook.com\/(.+)$/", $user['username'], $m)) {

			/*
			// not yet implemented.
			$fb_token = facebook_access_token();
			*/

			$fb_token = '';

			$graph_url = preg_replace("/^http:/", 'https:', $user['username']);
			$rv = "<img src=\"{$graph_url}/picture?width={$size}&height={$size}&{$fb_token}\" style='width: {$size}px; height: {$size}px;' />";

			// would really like to do this to avoid fooling around
			// with access tokens, but it doesn't seem like it can be
			// linkified without -much- hackery (if at all)
			// $rv = "<fb:profile-pic uid=\"{$m[2]}\" facebook-logo=\"true\" linked=\"false\" width=\"{$size}\" height=\"{$size}\"></fb:profile-pic>\n";

		} else {
			$userdata = json_decode($user['userdata'], 1);
			if (isset($userdata['icon_id']) && $userdata['icon_id']) {
				if ($size > 8) {
					$size = "&w={$size}&h={$size}";
				} else {
					$size = '';
				}
				$rv = "<img src='/d-image?id={$userdata['icon_id']}{$size}' />";
			}
		}

		return $rv;
	} // user_image()


	function thing_image_url($thing, $size = 0, $pad = 0) {
		$size = (int)$size;
		$rv = '/images/big_giant.png';
		if (isset($thing['icon_id']) && $thing['icon_id']) {
			if ($size > 8) {
				$size = "&w={$size}&h={$size}";
			} else {
				$size = '';
			}
			$rv = "/d-image?id={$thing['icon_id']}{$size}&p={$pad}";
		}
		return $rv;
	} // thing_image_url()


	function thing_image($thing, $size = 0) {
		// $rv = "<img src='/images/big_giant.png' style='vertical-align: top; width: {$size}px; height: {$size}px;' />";
		$rv = "<img src='" . thing_image_url($thing, $size) . "' style='width: 100%;' />";
		return $rv;
	} // thing_image()


	function search_html($classname = '', $query = '') {
		$query = htmlsafe($query);
		return "
			<div class='search {$classname}'>
				<img src='/images/crystal-search-64px.png' alt='spyglass' title='find stuff. like your self.' />
				Find <b>your friends</b>
				<form action='/search' method='get'>
					<input name='q' type='text' value=\"{$query}\" style='font-size: 20px; height: 25px; border: 1px solid gray; width: 67%;' />
				</form>
				(and other things)
			</div>
		";
	} // search_html()


	function explore_html($classname = '') {
		return "
			<div class='explore {$classname}'>
				<img src='/images/crystal-explore-64px.png' alt='earth' title=\"explore the whole world. that's right. all of it.\" />
				<div>Explore</div>
				<div class='notable'>
					<a href='/random'>something random</a>
				</div>
				<div>in our world.</div>
			</div>
		";
	} // explore_html()


	function things_html(
		$things,
		$place = false,
		$user = false,
		$favorite_thing_id = 0
	) {
		$rv = array();

		foreach ($things as $t) {
			$fav = $t['thing_id'] == $favorite_thing_id;
			$rv[] = thing_html($t, $place, $user, $fav);
		}

		if (sizeof($rv) > 0) {
			$rv = join("\n", $rv);
		} else {
			$rv = false;
		}

		return $rv;
	} // things_html()


	function thing_html(
		$thing,
		$place = false,
		$user = false,
		$favorite = false
	) {

		$place_id = $place ? $place['place_id'] : '';
		$t_name = htmlsafe($thing['name']);
		$t_details = htmlsafe($thing['details']);
		$favorite = $favorite ? '1' : '0';
		$user_id = $user ? $user['user_id'] : 0;
		$quantity = $thing['quantity'] ? $thing['quantity'] : 1;
		$mode = isset($thing['mode']) ? $thing['mode'] : '';

		return preg_replace("/[\t]+/", " ",
			"<tpdc:thing
				place_id=\"{$place_id}\" quantity=\"{$quantity}\"
				user_id=\"{$user_id}\" favorite=\"{$favorite}\"
				thing_id=\"{$thing['thing_id']}\" mode=\"{$mode}\"
				name=\"{$t_name}\" icon_id=\"{$thing['icon_id']}\"
				title=\"{$t_details}\">
			</tpdc:thing>"
		);
	} // thing_html()


	function result_html(
		$url = '', $title = '', $description = '', $image = '', $actions = ''
	) {
		if ($url) {
			$url = htmlsafe($url);
			$link_open = "<a href=\"{$url}\">";
			$link_close = "</a>";
		} else {
			$link_open = '';
			$link_close = '';
		}

		$title = htmlsafe($title);
		$description = htmlsafe($description);

		/*
		if ($actions) {
			$actions = "<tr><td></td>
				<td style='vertical-align: top;'>{$actions}</td>
			</tr>";
		}
		*/

		return "<table style='margin: 5px;'><tr>
			<td style='padding: 2px; width: 68px; overflow: hidden;'>
				{$link_open}{$image}{$link_close}
			</td>
			<td style='vertical-align: top;'>
				<b>{$link_open}{$title}{$link_close}</b>
				<br /><i>{$description}</i>
				{$actions}
			</td>
		</tr></table>";
	} // result_html()


	function tag_html($tag, $props = array()) {
		$_props = array();
		foreach ($props as $k => $v) {
			if ($v !== null) {
				$_props[] = $k . '="' . htmlsafe($v) . '"';
			}
		}
		$props_string = join(' ', $_props);
		return "<{$tag} {$props_string}></{$tag}>";
	} // tag_html()


	function og_tag($property, $value) {
		return tag_html('meta', array(
			'property' => $property,
			'content' => $value
		));
	} // og_tag()


	function resultcard_html(
		$result,
		$image = null,
		$title = null,
		$description = null,
		$url = null
	) {
		return tag_html('tpdc:resultcard', array(
			'result' => $result,
			'image' => $image,
			'header' => $title,
			'description' => $description,
			'url' => $url ? $url : $_SERVER['SCRIPT_URL']
		));
	} // resultcard_html()



	//
	// if a user has just signed in and there is an award_q,
	// process that queue and alert the user.
	//
	if (
		isset($_SESSION['award_q'])
		&& sizeof($_SESSION['award_q']) > 0
		&& get_user_id()
	) {
		foreach ($_SESSION['award_q'] as $award) {
			add_user_thing($award[0], $award[1]);
		}
		unset($_SESSION['award_q']);
		tpdc_notify("Items Collected!", "Check <a href='/inventory'>your things</a> to see what you got.");
	}

?>
