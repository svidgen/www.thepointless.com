<?php

// header('Content-type: application/x-javascript');
header('Content-type: text/javascript');

if (!isset($do_not_cache) || !$do_not_cache) {
	send_cache_control_headers('+1 year');
}

?>
//
// Copyright (c) 2017 http://www.thepointless.com/
//
// Provided as is, without warranty of any kind. This IS
// a work in progress. So, it's probaby buggy.
//
// Use it and abuse it however you like. But, if you'd be
// so kind, leave this notice in tact and don't hotlink!
//
// Jon Wire
// http://www.linkedin.com/in/jonwire
//

<?php

print $template_page_data;

?>
