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
	header('Pragma: cache');
	
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



function code_version($dir = DOCROOT) {
	$rv = filemtime($dir);
	$subdirs = glob("{$dir}/*", GLOB_ONLYDIR|GLOB_NOSORT);
	foreach ($subdirs as $subdir) {
		$rv = max($rv, code_version($subdir));
	}
	return $rv;
}


?>
