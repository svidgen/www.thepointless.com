<?php

function handle_error($e_number, $e_string, $e_file, $e_line) {
	$config = get_config();
	if ($config['debug_mode'] && (error_reporting() & $e_number)) {
		print "<pre style='font-size: 12px;'>\n\nError {$e_number}: \"{$e_string}\" at {$e_file}:{$e_line}\n";
		debug_print_backtrace();
		print "\n</pre>\n\n";
	}
	return true;
} // handle_error()

set_error_handler('handle_error');

?>
