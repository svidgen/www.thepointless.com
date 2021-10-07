<?php

header('Content-type: image/jpg');

if (!isset($do_not_cache) || !$do_not_cache) {
	send_cache_control_headers('+1 year');
}

print $args['content'];

?>
