<?php

header('Content-type: text/css');

send_cache_control_headers('+1 year');

print $template_page_data;

?>
