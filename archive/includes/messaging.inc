<?php

	require_once('includes/dbconnect.inc');


	function send($to, $from, $message, $ip = false) {
		if (!$to || !$message) {
			return false;
		}

		// maybe the default should be the signed in user?
		if (!$from) {
			$from = array('user_id' => 0);
		}

		if (!$ip) {
			$ip = $_SERVER['REMOTE_ADDR'];
		}

		$row = array(
			'to_id' => $to['user_id'],
			'from_id' => $from['user_id'],
			'message' => $message,
			'from_ip' => $ip
		);

		return my_insert('messages', $row);
	} // insert_message()


	function select_messages($criteria = array(), $options = array()) {
		if (!isset($options['order'])) {
			$options['order'] = 'message_id asc';
		}
		return my_select('messages', $criteria, $options);
	} // select_message()


	function select_conversation_messages($user, $with, $options = array(), $after = false) {
		if ($with) {
			$id1 = (int)$user['user_id'];
			$id2 = (int)$with['user_id'];
			$criteria = array(
				'from_id' => array($id1, $id2),
				'to_id' => array($id1, $id2)
			);
		} else {
			$criteria = array(
				my_where(array(
					'from_id' => $user['user_id'],
					'to_id' => $user['user_id']
				), 'or')
			);
		}

		if ($after) {
			$criteria['message_id>'] = (int)$after;
		}
		return select_messages($criteria);
	} // select_conversation_messages()


	function select_messages_after($user, $with, $after) {
		return select_conversation_messages($user, $with, array(), $after);
	} // select_messages_after()


	function select_conversations($user, $options = array()) {
		$userid = (int)$user['user_id'];
		$options['fields'] = array(
			"sum(to_id='{$userid}' and unread) unread",
			"if(from_id={$userid},to_id,from_id) with_id",
			'count(*) messages',
			'max(created) last_update'
		);

		$options['group'] = 'with_id';
		$options['order'] = 'unread desc, last_update asc';

		return my_select("messages",
			array(my_where(array(
				'from_id' => $userid,
				'to_id' => $userid
			),'or')),
			$options
		);

	} // select_conversations()


	function conversation_mark_read($to, $from, $max_id = 0) {
		$to_id = (int)$to['user_id'];
		$from_id = (int)$from['user_id'];
		if ($max_id > 0) {
			$max_id = (int)$max_id;
			$max_id_condition = "and message_id<={$max_id}";
		} else {
			$max_id_condition = '';
		}
		return my_query("update messages set unread=0 where to_id='{$to_id}' and from_id='{$from_id}' and unread=1 {$max_id_condition}");
	} // conversation_mark_read()


	function message_html($from, $message = false) {
		require_once('includes/game-inserts.inc');

		$from_image = htmlsafe(user_image($from, 50));
		$from_name = htmlsafe($from['name']);

		if ($message) {
			htmlsafe($message);
		} else {
			/*
			$message = "
				<tpdc:growingtextarea name='message'></tpdc:growingtextarea>
				<br /><input type='submit' value='send' />
			";
			*/
		}

		/*
		return "<table style='width: 90%;'>
			<tr>
				<td style='width: 60px; text-align: center; vertical-align: top; padding: 5px; '>{$from_image}</td>
				<td style='vertical-align: top;'>
					<b>{$from_name}</b><br />
					{$message}
				</td>
			</tr>
		</table>";
		*/

		return "<tpdc:message image=\"{$from_image}\" name=\"{$from_name}\" message=\"{$message}\"></tpdc:message>";

	} // message_html()


?>
