<?php


function handle_error($e_number, $e_string, $e_file, $e_line) {
	global $debug_mode;
	if ($debug_mode && (error_reporting() & $e_number)) {
		print "<pre style='font-size: 12px;'>\n\nError {$e_number}: \"{$e_string}\" at {$e_file}:{$e_line}\n";
		debug_print_backtrace();
		print "\n</pre>\n\n";
	}
	return true;
} // handle_error()


if (!function_exists('array_column')) {
	function array_column($arr, $key) {
		$rv = array();
		foreach ($arr as $row) {
			$rv[] = $row[$key];
		}
		return $rv;
	} // array_column()
} // if !array_column


function current_timestring() {
	if (isset($_SESSION['tz_offset']) && $_SESSION['tz_offset']) {
		$offset = $_SESSION['tz_offset'];
	} else {
		$offset = 300;
	}

	return gmdate('D, d M Y g:i A (\G\M\T' . offset_string($offset) . ')', time() - round($offset * 60));
} // current_timestring()


function offset_string($o) {
	if ($o == 0) {
		return '';
	} elseif ($o > 0) {
		$sign = '-';
	} else {
		$sign = '+';
	}

	$m = $o % 60;
	$h = ($o - $m) / 60;

	$m = str_pad($m, 2, '0', STR_PAD_LEFT);
	$h = str_pad($h, 2, '0', STR_PAD_LEFT);

	return $sign . $h . ':' . $m;
} // offset_string()


function htmlsafe($s) {
	return htmlentities($s, ENT_QUOTES, 'utf-8');
} // htmlsafe()


function send_cache_control_headers($t = '+1 year') {
	// set cache-control header
	$cc_header = strtotime($t, 0);
	header("Cache-Control: max-age={$cc_header}");

	// set expires header
	$exp_header = gmdate('D, d M Y H:i:s \G\M\T', strtotime($t));
	header("Expires: {$exp_header}");

	// set pragma header to NOT "no-cache"
	// to avoid stepping on any pages' toes that might wish to
	// use the pragma header, verify that it is set to no-cache
	// before overwrting.
	$current_headers = headers_list();
	foreach ($current_headers as $header) {
		if ($header == 'Pragma: no-cache') {
			header('Pragma: cache');
			break;
		}
	}
	
} // expires_headers()


// send redirect headers and HTML (for browsers that don't support Location header?)
function redirect($url) {
	global $base_url;

	// prepend the base_url if necessary, to make the URL absolute.
	if (!preg_match("/^http/", $url)) {
		$url = $base_url . preg_replace('/^\/+/', '', $url);
	}

	header("Location: {$url}");

	print "<html>
		<head>
			<title>Page moved</title>
		</head>
		<body>
			This page has moved to <a href='{$url}'>{$url}</a>.
		</body>
		</html>
	";

	// prevent any further processing.
	exit();
} // redirect()


function merge_querystring($base_url, $mods) {
	// break the base url into parts
	$base_parts = preg_split('/\?/', $base_url);
	if (sizeof($base_parts) == 1) {
		$base_page = $base_parts[0];
		$base_querystring = '';
	} elseif (sizeof($base_parts) > 1) {
		$base_page = $base_parts[0];
		$base_querystring = join('', array_slice($base_parts, 1));
	}


	// break the query into parts
	$base_query = array();
	parse_str($base_querystring, $base_query);

	// break the mods into parts
	if (is_array($mods)) {
		$mods_query = $mods;
	} else {
		$mods_query = array();
		parse_str($mods, $mods_query);
	}
	
	// merge the query strings
	foreach ($mods_query as $k => $v) {
		$base_query[$k] = $mods_query[$k];
	}

	// reassimiliate the modified query
	$new_querystring = http_build_query($base_query);

	// rebuild and return the url
	return $base_page . '?' . $new_querystring;

} // merge_querystring()


function rebuild_url($parts) {
	$rv = array(
		$parts['scheme'],
		'://'
	);

	if (isset($parts['user'])) {
		$rv[] = $parts['user'];
		if (isset($parts['pass'])) {
			$rv[] = ':' . $parts['pass'];
		}
		$rv[] = '@';
	}

	$rv[] = $parts['host'];

	if (isset($parts['port'])) {
		$rv[] = ':' . $parts['port'];
	}

	if (isset($parts['path'])) {
		$rv[] = $parts['path'];
	}

	if (isset($parts['query'])) {
		$rv[] = '?' . $parts['query'];
	}

	if (isset($parts['fragment'])) {
		$rv[] = '#' . $parts['fragment'];
	}

	return join($rv);

} // rebuild_url()


function add_token($action, $token = false) {
	if (!isset($_SESSION['action_tokens']) || !is_array($_SESSION['action_tokens'])) {
		$_SESSION['action_tokens'] = array();
	}

	if (!$token) {
		$token = mykeygen();
	}

	$_SESSION['action_tokens'][$token] = array(
		'action' => $action,
		'time' => time()
	);

	while (sizeof($_SESSION['action_tokens']) > 64) {
		$lowest_time = false;
		$lowest_token = false;
		foreach ($_SESSION['action_tokens'] as $k => $v) {
			if (!$lowest_time || $lowest_time > $v['time']) {
				$lowest_time = $v['time'];
				$lowest_token = $k;
			} 
		}
		unset($_SESSION['action_tokens'][$lowest_token]);
	}

	return $token;
} // add_token()


function get_token($token) {
	if (isset($_SESSION['action_tokens']) && is_array($_SESSION['action_tokens'])) {
		if (isset($_SESSION['action_tokens'][$token])) {
			$action = $_SESSION['action_tokens'][$token]['action'];
			unset($_SESSION['action_tokens'][$token]);
			return $action;
		} else {
			return false;
		}
	} else {
		return false;
	}
} // get_token()


function time_elapsed() {
	global $__pageload_start;
	return round(microtime(true) - $__pageload_start, 3);
} // time_elapsed();


function gets_set($keys) {
	if (!is_array($keys)) {
		return gets_set(func_get_args());
	}

	foreach ($keys as $k) {
		if (!isset($_GET[$k])) {
			return false;
		}
	}

	return true;
} // gets_set()


?>
