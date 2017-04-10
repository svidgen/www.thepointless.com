<?php

	//
	// config
	//

	if (!isset($_tg_api_session_funcs)) {
		$_tg_api_session_funcs = 'tg-api-auth';
	}

	if (!isset($_tg_api_session_tokens)) {
		$_tg_api_session_tokens = 'tg-api-tokens';
	}

	if (!isset($_tg_api_session_connections)) {
		$_tg_api_session_connections = 'tg-api-connections';
	}

	if (!isset($_tg_api_data_directory)) {
		$_tg_api_data_directory = '/var/www/tg-data';
	}

	if (!isset($_tg_api_token)) {
		$_tg_api_token = '98u9p8hasdf23p9inpviu09871235ionfa';
	}


	//
	// tg_api_state()
	// makes a global state available to JavaScript clients via a tg_api.
	// exposes all global TG.DataObject's.
	//
	// *** REQUIRES SPIDERMONKEY ***
	//

	$_tg_data_exports = array();
	$_tg_data_files = array();


	function tg_api_state_self_test() {
		$js_self_test = file_get_contents('includes/tg-self-test.js');
		tg_api_state('TG', $js_self_test);
	} // tg_api_state_self_test()


	function tg_api_state($namespace, $init_script, $store = null) {
		global $_tg_data_files, $_tg_api_data_directory, $_tg_api_token, $_tg_data_exports, $debug_mode;


		function tg_lock($handle, $lock, $timeout = 1) {
			$start = microtime(1);

			$locked = false;
			while (!$locked && microtime(1) - $start < $timeout) {
				$locked = flock($handle, $lock | LOCK_NB);
				if (!$locked) {
					usleep(floor(rand(0,100) * 1000)); // 0 to 100 ms
				}
			}

			return $locked;
		} // tg_lock()

		function tg_txn_restart() {
			// how the devil will this work?
		} // tg_txn_restart()

		function tg_save($o) {
			global $_tg_data_files, $_tg_api_token, $_tg_api_data_directory;

			$o = json_decode($o);
			if (!isset($o->{'tg-id'})) {
				$id = join('.', array(
					'mc1', microtime(1), hash('md5', rand(1000000, 9999999))
				));
				$o->{'tg-id'} = $id;
			}

			if (!isset($_tg_data_files[$o->{'tg-id'}])) {
				$_tg_data_files[$o->{'tg-id'}] = array();
			}
			$f = &$_tg_data_files[$o->{'tg-id'}];

			if (!isset($f['handle'])) {
				$f['handle'] = fopen("{$_tg_api_data_directory}/{$o->{'tg-id'}}.json", 'w');
				if (!isset($f['open(w)'])) {
					$f['open(w)'] = 0;
				}
				$f['open(w)'] += 1;
			}

			if (!isset($f['write'])) {
				if (!tg_lock($f['handle'], LOCK_EX)) {
					// TODO: try again for N seconds. restart request
					// after some number of attempts.
					tg_txn_restart();
				}
				$f['write'] = true;
				$f['tg_writes'] = 1;
			} else {
				$f['tg_writes'] += 1;
			}

			$f['data'] = json_encode($o);

			if (isset($f['write'])) {
				return $o->{'tg-id'};
			} else {
				return false;
			}
		} // tg_save()

		function tg_retrieve($id) {
			global $_tg_data_files, $_tg_api_data_directory;

			$handle = null;
			if (!isset($_tg_data_files[$id])) {
				$handle = @fopen("{$_tg_api_data_directory}/{$id}.json", 'r+');
				if ($handle) {
					if (!tg_lock($handle, LOCK_SH)) {
						tg_txn_restart();
					}
					$_tg_data_files[$id] = array(
						'handle' => $handle
					);
				} else {
					return false;
				}
			}

			if ($handle) {
				$data = '';
				while (!feof($handle)) {
					$data .= fread($handle, 16384);
				}
				$_tg_data_files[$id]['data'] = $data;
				$_tg_data_files[$id]['tg_retrieves'] = 1;
			} else {
				// $_tg_data_files[$id]['tg_retrieves'] += 1;
			}

			return $_tg_data_files[$id]['data'];
		} // retrieve()

		function tg_delete($id) {
			// throw new Exception("Not yet implemented.");
			print "console.log('DataObject.delete is not yet implemented.');";
			return false;
		} // delete()

		function tg_fire_event($object_id, $event_name, $return_fn) {
			// what should this do!?
		} // tg_fire_event()

		function tg_expose($id, $methods) {
			global $_tg_data_exports;
			$_tg_data_exports[$id] = $methods;
		} // tg_expose()

		function tg_log($v) {
			print "console.log({$v});";
		}; // tg_log()

		$tg_detach = function($commit = true) {
			global $_tg_data_files;

			$rv = true;

			// API has been "started", which means file reads/writes
			// have occurred. iterate through all open files, write any
			// data waiting to be written, unlock everything, and close.
			foreach ($_tg_data_files as $f) {
				if (isset($f['write']) && $commit) {
					ftruncate($f['handle'], strlen($f['data']));
					rewind($f['handle']);
					fwrite($f['handle'], $f['data']);
					fflush($f['handle']);
				}
				tg_lock($f['handle'], LOCK_UN);
				fclose($f['handle']);
			}

			$_tg_data_files = array();
		}; // tg_detach()

		if (!class_exists('JSContext')) {
			require_once('includes/js-console.inc');
			$js = new JSConsole();
		} else {
			$js = new JSContext();
		}

		$tg_attach = function() use ($js, $init_script) {
			$js_server = file_get_contents('includes/tg-server.js');
			$js->evaluateScript($js_server);
			$js->registerFunction('tg_save', 'tg_save');
			$js->registerFunction('tg_retrieve', 'tg_retrieve');
			$js->registerFunction('tg_delete', 'tg_delete');
			$js->registerFunction('tg_expose', 'tg_expose');
			$js->registerFunction('tg_log', 'tg_log');
			$js->evaluateScript($init_script);

			// expose globals and restore state.
			// TODO: move state-restoration into TG.DataObject, if possible
			$js->evaluateScript("TG.refreshAllGlobals();");
		}; // tg_attach()

		call_user_func_array($tg_attach, array());

		$fns = array();
		$events = array();
		foreach ($_tg_data_exports as $id => $members) {
			foreach ($members as $m) {

				if ($m->type == 'method') {
					$filename = '';
					$fname = "{$id}.{$m->name}";
					$event_modified = null;
					$new_modified = null;
				} elseif ($m->type == 'event') {
					$filename = "{$id}.json";
					$fname = "{$id}.{$m->name}.poll";
					$event_modified = $m->modified;
					$new_modified = "{$id}.{$m->name}.modified";
				}

				$fn = function() use (
					$js, $fname, $event_modified, $new_modified
				) {

					$args = func_get_args();
					if (sizeof($args) == 0 && $event_modified) {
						$args[] = $event_modified;
					}

					foreach ($args as $k => $v) {
						$args[$k] = json_encode($v);
					}
					$args = join(",", $args);

					$src = "TG.stringify({$fname}({$args}));";

					// testing ... or am i?
					try {
						$rv = array(
							'tg-json-rv' => $js->evaluateScript($src)
						);

						if ($event_modified) {
							$mtime = $js->evaluateScript("{$new_modified};");
							$rv['tg-api-alter-request'] = array($mtime);
						}

						return $rv;
					} catch (Exception $e) {
						return array(
							'tg-error' => $e->getMessage() . " at " . $src
						);
					}
				};

				if ($m->type == 'method') {
					$fns["{$id}.{$m->name}"] = $fn;
				} elseif ($m->type == 'event') {
					$events["{$id}.{$m->name}"] = array(
						'latency' => $m->latency,
						'function' => $fn,
						'modified' => $m->modified,
					);
				}
			} // foreach (members)
		} // foreach (dataexports)

		tg_api_start($namespace, $fns, $events, false, $tg_attach, $tg_detach);

		call_user_func_array($tg_detach, array());

	} // tg_api_state()



	//
	// tg_api_start()
	// process a tg-api request if all tg-api request params are present.
	//
	// <path to host file>?t=token&c=callback&a=[{f:function,p:param-object-or-array}]
	//


	function tg_api_start(
		$namespace = "TG.API",
		$functions = false,
		$pollable = false,
		$debug_mode = false,
		$data_attach = null,
		$data_detach = null
	) {
		global $_tg_api_session_connections, $_tg_api_session_tokens;

		$debug_info = array();

		if (!$functions) {
			$functions = array(
				'md5' => 'md5',
				'crc32' => 'crc32'  // or, for PHP >= 5.3 : function(p) { return crc32(p); }
			);
		}

		if (!$pollable) {
			$pollable = array();
		}

		if (!$namespace) {
			$namespace = "API";
		}


		$subspaces = array();
		foreach ($functions as $k => $v) {
			$functions["{$namespace}.{$k}"] = $v;
			unset($functions[$k]);
		}

		foreach ($pollable as $k => $v) {
			$pollable["{$namespace}.{$k}"] = $v;
			unset($pollable[$k]);
		}


		$api = json_encode(preg_replace("/\?.*/", "", $_SERVER['REQUEST_URI']));

		// short cirtuit if a token request is being made
		if (isset($_GET['tg-tr'])) {
			$tokens = array();
			for ($i = 0; $i < 4; $i++) {
				$tokens[] = tg_api_get_token($api);
			}
			$tokens = json_encode($tokens);
			tg_send_cache_control_headers('-20 years');
			print "<html><body><script type='text/javascript'>window.parent.TG.API[{$api}].t={$tokens};</script></body></html>";
			return;
		}

		// short circuit if not all params are present
		if (
			!isset($_REQUEST['tg-t'])
			&& !isset($_REQUEST['tg-a'])
			&& !isset($_REQUEST['tg-w'])
		) {

			tg_send_cache_control_headers('-20 years');
			header("Content-type: text/javascript");

			//
			// write namespaces
			//

			$spaces = array();
			$spaces[] = tg_api_provide_ns(array_keys($functions));
			$spaces[] = tg_api_provide_ns(array_keys($pollable));

			$rv = array();
			if ($namespace != "TG.API") { $rv[] = join("\n", $spaces); }

			$rv[] = "TG.API.APIs = TG.API.APIs || [];";
			$rv[] = "TG.API.APIs.push({$api});";


			//
			// write functions
			//

			foreach ($functions as $name => $target) {
				$fullname = "{$namespace}.{$name}";
				$rv[] = "{$name}=function(){return TG.API.jsonp({$api},\"{$name}\",TG.argumentsArray(arguments));};";
			}

			foreach ($pollable as $name => $target) {
				$fullname = "{$namespace}.{$name}";
				$rv[] = "{$name}=function(){return TG.API.start({$api},\"{$name}\",TG.argumentsArray(arguments));};";
			}

			// $rv[] = "TG.API.requestToken({$api});";
			// ^^^ Why is this commented out line here!!?? ^^^

			print join("\n", $rv) . "\n";
			return;
		}


		// short circuit if the token is bad
		if (!tg_api_check_token($_REQUEST['tg-t'], $api)) {
			$bad_token = json_encode($_REQUEST['tg-t']);
			print "console.log(\"Bad token.\",{$bad_token});";
			return;
		}

		// replace the token immediately
		$new_token = tg_api_get_token($api);

		// attempt to decode the action array (_REQUEST['a']) and execute each function
		$rv = array();
		$rv[] = "TG.API[{$api}].t.push('{$new_token}');";


		$rvs = array();
		if (isset($_REQUEST['tg-w'])) {
			tg_api_add_connection($_REQUEST['tg-t']);

			// suppress further headers
			print "/* */\n";
			flush();
			ob_flush();

			$actions = json_decode($_REQUEST['tg-w'], 1);

			$pollable_functions = array();


			$schedule = array();
			foreach ($actions as $k => $a) {
				if (isset($pollable[$a['f']])) {
					$schedule[$k] = 0; // $pollable[$a['f']];
					$pollable_functions[$a['f']] = $pollable[$a['f']]['function'];
				}
			}


			// $session_name = session_name();
			session_write_close();
			$start = microtime(1);
			$next_dc_check = 2;
			$runtime = 0;
			while (
				$runtime < 30
			) {
				// session_name($session_name);
				// @session_start();

				if ($next_dc_check <= $runtime) {
					@session_start();
					session_write_close();
					if (tg_api_disconnect_waiting($_REQUEST['tg-t'])) {
						break;
					}
					$next_dc_check += 2;
				}

				$sleeptime = 31;
				$_actions = array();
				foreach ($actions as $k => $action) {
					$f = $action['f'];
					$add = array();
					if (isset($pollable[$f])) {
						$sleeptime = min($pollable[$f]['latency'], $sleeptime);
						if ($schedule[$k] <= $runtime) {
							$schedule[$k] += $pollable[$f]['latency'];
							$add = $action;

							$jsa = json_encode($action);

							if (!isset($debug_info[$jsa])) {
								$debug_info[$jsa] = 0;
							}
							$debug_info[$jsa] += 1;
						}
					}
					$_actions[] = $add;
				}

				// print "/* schedule: \n" . print_r($schedule, 1) . "\n*/\n\n";
				// print "/* _actions: \n" . print_r($_actions, 1) . "\n*/\n\n";

				$rvs = tg_api_do_actions($_actions, $pollable_functions);
				if (tg_api_has_rv($rvs)) {
					break;
				}

				if ($data_detach) {
					call_user_func_array($data_detach, array());
				}

				// print "/* rvs: \n" . print_r($rvs, 1) . "\n*/\n\n";

				// session_write_close();
				usleep(max(150000, $sleeptime * 1000000));
				$runtime = microtime(1) - $start;
			}

			if ($debug_mode) {
				$debug_info['session'] = $_SESSION[$_tg_api_session_connections];
				print "\n/* " . print_r($debug_info, 1) . " */\n";
			}

		} elseif (isset($_REQUEST['tg-a'])) {
			$actions = json_decode($_REQUEST['tg-a'], 1);
			$rvs = tg_api_do_actions($actions, $functions);
		}

		foreach ($rvs as $k => $fnrv) {
			$fnrv_json = null;

			if (is_array($fnrv)) {
				if (isset($fnrv['tg-api-alter-request'])) {
					$rv[] = "TG.API.alter(\"{$_REQUEST['tg-t']}\",{$k}," . json_encode($fnrv['tg-api-alter-request']) . ');';
					unset($fnrv['tg-api-alter-request']);
				}

				if (isset($fnrv['tg-api-stop'])) {
					$rv[] = "TG.API.stop(\"{$_REQUEST['tg-t']}\",{$k});";
					unset($fnrv['tg-api-stop']);
				}

				if (isset($fnrv['tg-api-eval'])) {
					$rv[] = $fnrv['tg-api-eval'];
					unset($fnrv['tg-api-eval']);
				}

				if (isset($fnrv['tg-json-rv'])) {
					$fnrv_json = $fnrv['tg-json-rv'];
				}
			}

			if ($fnrv_json == null) {
				$fnrv_json = json_encode($fnrv);
			}

			$rv[] = "TG.API.cb(\"{$_REQUEST['tg-t']}\",{$k},{$fnrv_json});";
		}

		print join($rv, "\n");
		
	} // tg_api_start()


	// TODO: make this better.
	function tg_api_provide_ns($fns) {
		$rv = array();
		foreach ($fns as $f) {
			$ns_parts = preg_split("/\./", $f);
			array_pop($ns_parts);
			$ns_parent = "";
			if (sizeof($ns_parts) > 0) {
				$line = array();
				foreach ($ns_parts as $p) {
					$init = $ns_parent . $p;
					$line[] = "{$init}={$init}||{};";
					$ns_parent = $init . '.';
				}
				$line = "var " . join("", $line);
				if (!in_array($line, $rv)) {
					$rv[] = $line;
				}
			}
		}
		return join("\n", $rv);
	} // tg_api_add_ns()


	function tg_api_do_actions($actions, $fn_pool) {
		$rv = array();
		foreach ($actions as $k => $a) {
			if (!isset($a['f'])) {
				$fnrv = null;
			} elseif ($a['f'] == 'tg-api-disconnect') {
				tg_api_disconnect($a['p'][0]);
				$fnrv = array($a, $_SESSION['tg-api-connections']);
			} elseif (isset($fn_pool[$a['f']])) {
				$fnrv = call_user_func_array($fn_pool[$a['f']], $a['p']);
			} else {
				$fnrv = array('tg-api-error' => "NO SUCH FUNCTION");;
			}
			$rv[] = $fnrv;
		}
		return $rv;
	} // tg_api_do_actions()


	function tg_api_has_rv($returns) {
		foreach ($returns as $rv) {
			if (is_array($rv)) {
				if (isset($rv['tg-json-rv'])) {
					return tg_api_has_rv(array(json_decode(
						$rv['tg-json-rv']
					)));
				}

				$size = sizeof($rv);
				foreach ($rv as $k => $v) {
					if (preg_match("/^tg-api-/", $k)) {
						$size--;
					}
				}
				if ($size > 0) {
					return true;
				}
			} else {
				if ($rv !== null && $rv !== '') {
					return true;
				}
			}
		}
		return false;
	} // tg_api_no_rv()


	function tg_api_add_connection($token) {
		global $_tg_api_session_connections;
		$_SESSION[$_tg_api_session_connections][$token] = array(
			'connected' => microtime(1)
		);
		tg_api_prune_connections();
	} // tg_api_add_connection()


	function tg_api_disconnect($token) {
		global $_tg_api_session_connections;
		if (isset($_SESSION[$_tg_api_session_connections][$token])) {
			$_SESSION[$_tg_api_session_connections][$token]['dc'] = true;
		}
	} // tg_api_disconnect()


	function tg_api_disconnect_waiting($token) {
		global $_tg_api_session_connections;
		if (isset($_SESSION[$_tg_api_session_connections][$token])) {
			if (isset($_SESSION[$_tg_api_session_connections][$token]['dc'])) {
				return (bool)$_SESSION[$_tg_api_session_connections][$token]['dc'];
			}
		}
		return false;
	} // tg_api_disconnect_waiting()


	function tg_api_prune_connections() {
		global $_tg_api_session_connections;
		foreach ($_SESSION[$_tg_api_session_connections] as $k => $v) {
			if ($v['connected'] + 30 < microtime(1)) {
				unset($_SESSION[$_tg_api_session_connections][$k]);
			}
		}
	} // tg_api_prune_connections()


	function tg_api_check_token($token, $check_action = 'tg-api') {
		global $_tg_api_session_tokens;

		if (isset($_SESSION[$_tg_api_session_tokens]) && is_array($_SESSION[$_tg_api_session_tokens])) {
			if (isset($_SESSION[$_tg_api_session_tokens][$token])) {
				$action = $_SESSION[$_tg_api_session_tokens][$token]['action'];
				unset($_SESSION[$_tg_api_session_tokens][$token]);
				return $action == $check_action;
			} else {
				return false;
			}
		} else {
			return false;
		}

	} // tg_api_check_token()


	function tg_api_get_token($action = 'tg-api') {
		global $_tg_api_session_tokens;
		
		if (!isset($_SESSION[$_tg_api_session_tokens]) || !is_array($_SESSION[$_tg_api_session_tokens])) {
			$_SESSION[$_tg_api_session_tokens] = array();
		}

		$token = md5(rand() . time());
		$_SESSION[$_tg_api_session_tokens][$token] = array(
			'action' => $action,
			'time' => time()
		);

		while (sizeof($_SESSION[$_tg_api_session_tokens]) > 128) {
			$lowest_time = false;
			$lowest_token = false;
			foreach ($_SESSION[$_tg_api_session_tokens] as $k => $v) {
				if (!$lowest_time || $lowest_time > $v['time']) {
					$lowest_time = $v['time'];
					$lowest_token = $k;
				} 
			}
			unset($_SESSION[$_tg_api_session_tokens][$lowest_token]);
		}

		return $token;

	} // tg_api_get_token()


	function tg_send_cache_control_headers($t = '+1 year') {
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
	} // tg_send_cache_control_headers()

?>
