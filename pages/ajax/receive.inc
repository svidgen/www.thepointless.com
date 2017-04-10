<?php

$do_not_cache = true;

$timeout = 25;
$channel = isset($_GET['channel']) ? substr($_GET['channel'], 0, 16) : "general_chat";
$last_received = isset($_GET['last']) ? (int)$_GET['last'] : 0;

// unblock/unlock session
session_commit();

require_once('includes/simple_messaging.inc');
$messages = receive_messages($channel, $last_received, $timeout);
$json_response = json_encode($messages);

?>
