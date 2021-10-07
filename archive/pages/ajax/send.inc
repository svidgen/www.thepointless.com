<?php

$do_not_cache = true;
$channel = isset($_GET['channel']) ? substr($_GET['channel'], 0, 16) : "general_chat";
$message = isset($_GET['m']) ? $_GET['m'] : '';


require_once('includes/simple_messaging.inc');
$json_response = json_encode((bool)send_message($channel, $message));


?>
