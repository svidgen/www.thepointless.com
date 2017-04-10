<?php

header('Content-type: image/png');

if (!isset($do_not_cache) || !$do_not_cache) {
	send_cache_control_headers('+1 year');
}

print $template_page_data;

?>
