<?php

	$meta_title = 'inbox';

	require_once('includes/auth.inc');
	require_once('includes/game-inserts.inc');
	require_once('includes/messaging.inc');

	$user = authenticate();

	$conversations = select_conversations($user, array('sql' => 0));

	// print "<pre>" . print_r($conversations, 1) . "</pre>";
	// return 1;

	$new_messages = array();
	$old_messages = array();
	$hr_printed = false;

	foreach ($conversations as $c) {
		$with = select_user(array('user_id' => $c['with_id']));
		$name = htmlsafe($with['name']);
		$image = htmlsafe(user_image($with, 50));
		$ch = "<tpdc:conversationheader user-id=\"{$c['with_id']}\" username=\"{$name}\" image=\"{$image}\" last-update=\"{$c['last_update']}\" unread=\"{$c['unread']}\"></tpdc:conversationheader>";
		if ($c['unread'] > 0) {
			$new_messages[] = $ch;
		} else {
			$old_messages[] = $ch;
		}
	}

	if (sizeof($new_messages) > 0) {
		print join("\n", $new_messages);
	} else {
		print "No unread messages.";
	}

	print "<hr>";

	if (sizeof($old_messages) > 0) {
		print join("\n", $old_messages);
	}

?>
