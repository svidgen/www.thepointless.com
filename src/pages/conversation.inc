<?php

	$meta_title = 'a conversation';

	require_once('includes/messaging.inc');
	require_once('includes/game-inserts.inc');

	$user = authenticate();

	if (!isset($_GET['with'])) {
		redirect('/search');
	}

	$with = select_user(array('user_id' => $_GET['with']));
	if (!$with) {
		redirect('/search');
	}

	$user_name = htmlsafe($user['name']);
	$user_image = htmlsafe(user_image($user, 50));
	$with_name = htmlsafe($with['name']);
	$with_image = htmlsafe(user_image($with, 50));
	print "<h3>Between <i>You</i> and <i><a href='/profile?id={$with['user_id']}'>{$with_name}</a></i></h3>";

	$messages = select_conversation_messages($user, $with, array('sql' => 0));
	$messages_html = array();
	foreach ($messages as $m) {
		if ($m['from_id'] == $user['user_id']) {
			$name_html = $user_name;
			$image_html = $user_image;
		} else {
			$name_html = $with_name;
			$image_html = $with_image;
		}
		$m_html = htmlsafe(htmlsafe($m['message']));
		$m_id = (int)$m['message_id'];
		$messages_html[] = "<tpdc:message unread=\"{$m['unread']}\" message-id=\"{$m_id}\" image=\"{$image_html}\" name=\"{$name_html}\" message=\"{$m_html}\"></tpdc:message>";
	}
	$messages_html = join("\n", $messages_html);

	conversation_mark_read($user, $with);

	print "<tpdc:conversation user=\"{$user_name}\" user-image=\"{$user_image}\" with=\"{$with['user_id']}\">
		{$messages_html}
	</tpdc:conversation>";

?>
