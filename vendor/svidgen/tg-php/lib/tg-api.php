<?php

	//
	// config
	//

	if (!isset($_tg_api_session_tokens)) {
		$_tg_api_session_tokens = 'tg-api-tokens';
	}

	if (!isset($_tg_api_session_connections)) {
		$_tg_api_session_connections = 'tg-api-connections';
	}


	//
	// tg_api_start()
	//

	function tg_api_start(
		$namespace = "TG.API",
		$functions = null,
		$pollables = null,
		$debug_mode = false,
		$endpoint = null
	) {
		global $_tg_api_session_connections, $_tg_api_session_tokens;

		$debug_info = array();
		$functions = namespaced_functions($namespace, $functions);
		$pollables = namespaced_functions($namespace, $pollables);

		$api = json_encode($endpoint ? $endpoint : $_SERVER['REQUEST_URI']);

		$token = isset($_REQUEST['tg-t']) ? $_REQUEST['tg-t'] : null;
		$actions = isset($_REQUEST['tg-a']) ? $_REQUEST['tg-a'] : null;
		$polls = isset($_REQUEST['tg-w']) ? $_REQUEST['tg-w'] : null;

		if (!$token && !$actions && !$polls) {
			print function_includes($api, $namespace, $functions, $pollables);
			print "\n";
			return;
		}

		if (isset($polls)) {
			$result = handle_poll($token, $polls);
		} elseif (isset($actions)) {
			$actions = json_decode($actions, 1);
			if (!is_array($actions)) {
				throw new \Exception("Invalid actions list.");
			}
			$result = tg_api_do_actions($actions, $functions);
		} else {
			$result = [
				'return_values' => [],
				'timings' => []
			];
		}

		print jsonp_response($token, $result, $debug_mode);
	}


	function jsonp_response($token, $result, $debug_mode) {
		$rv = [];
		$return_values = $result['return_values'];
		$timings = $result['timings'];
		foreach ($return_values as $k => $fnrv) {
			$fnrv_json = null;

			if (is_array($fnrv)) {
				if (isset($fnrv['tg-api-alter-request'])) {
					$rv[] = "TG.API.alter(\"{$token}\",{$k}," . json_encode($fnrv['tg-api-alter-request']) . ');';
					unset($fnrv['tg-api-alter-request']);
				}

				if (isset($fnrv['tg-api-stop'])) {
					$rv[] = "TG.API.stop(\"{$token}\",{$k});";
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

			if (is_object($fnrv)) {
				tg_api_add_function_references($fnrv);
			}

			if ($fnrv_json == null) {
				$fnrv_json = json_encode($fnrv);
			}

			$rv[] = "TG.API.cb(\"{$token}\",{$k},{$fnrv_json});";
		}

		if ($debug_mode) {
			// foreach ($timings as $k => $timing) {
				// $timing_json = json_encode([$k, $timing]);
				// $rv[] = "console.log({$k}, {$timing_json});";
			// }
			$timing_json = json_encode($timings);
			$rv[] = "console.log({$timing_json});";
		}

		return join($rv, "\n");
	}

	function namespaced_functions($namespace, $functions, $default = null) {
		$rv = array();

		if (!$functions) {
			// example functions, showing two ways to define.
			$functions = $default ? $default : array(
				'md5' => 'md5',
				'crc32' => function($p) { return crc32($p); }
			);
		}

		foreach ($functions as $k => $v) {
			$rv["{$namespace}.{$k}"] = $v;
		}

		return $rv;
	}


	function function_includes($api, $namespace, $functions, $pollables) {

		//
		// write namespaces
		//

		$spaces = array();
		$spaces[] = tg_api_provide_ns(array_keys($functions));
		$spaces[] = tg_api_provide_ns(array_keys($pollables));

		$rv = array();
		if ($namespace != "TG.API") { 
			$rv[] = join("\n", $spaces);
		}

		$rv[] = "TG.API.APIs = TG.API.APIs || [];";
		$rv[] = "TG.API.APIs.push({$api});";


		//
		// write functions
		//

		foreach ($functions as $name => $target) {
			$fullname = "{$namespace}.{$name}";
			$rv[] = "{$name}=function(){return TG.API.jsonp({$api},\"{$name}\",TG.argumentsArray(arguments));};";
		}

		foreach ($pollables as $name => $target) {
			$fullname = "{$namespace}.{$name}";
			$rv[] = "{$name}=function(){return TG.API.start({$api},\"{$name}\",TG.argumentsArray(arguments));};";
		}

		return join("\n", $rv);
	}


	function handle_poll($token, $actions) {
		tg_api_add_connection($token);

		// suppress further headers
		print "/* */\n";
		flush();
		ob_flush();

		$actions = json_decode($actions, 1);

		$pollable_functions = array();

		$schedule = array();
		foreach ($actions as $k => $a) {
			if (isset($pollable[$a['f']])) {
				$schedule[$k] = 0; // $pollable[$a['f']];
				$pollable_functions[$a['f']] = $pollable[$a['f']]['function'];
			}
		}

		session_write_close();
		$start = microtime(1);
		$next_dc_check = 2;
		$runtime = 0;
		while (
			$runtime < 30
		) {
			if ($next_dc_check <= $runtime) {
				@session_start();
				session_write_close();
				if (tg_api_disconnect_waiting($token)) {
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

			$result = tg_api_do_actions($_actions, $pollable_functions);
			if (tg_api_has_rv($rvs)) {
				break;
			}

			// session_write_close();
			usleep(max(150000, $sleeptime * 1000000));
			$runtime = microtime(1) - $start;
		}

		if ($debug_mode) {
			$debug_info['session'] = $_SESSION[$_tg_api_session_connections];
			print "\n/* " . print_r($debug_info, 1) . " */\n";
		}

	}


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
	}


	function tg_api_do_actions($actions, $fn_pool) {
		global $adapter;
		$rv = array();
		$timings = [];
		foreach ($actions as $k => $a) {
			$start = microtime(1);
			try {
				if (!isset($a['f'])) {
					$fnrv = null;
				} elseif ($a['f'] == 'tg-api-disconnect') {
					tg_api_disconnect($a['p'][0]);
					$fnrv = array($a, $_SESSION['tg-api-connections']);
				} elseif (isset($fn_pool[$a['f']])) {
					$fnrv = call_user_func_array($fn_pool[$a['f']], $a['p']);
				} elseif (preg_match("/o\((.+)\)\.(.+)/", $a['f'], $matches)) {
					$context = unserialize($matches[1]);
					$fnrv = call_user_func_array(
						array($context, $matches[2]),
						$a['p']
					);
				} else {
					$fnrv = array('tg-api-error' => "NO SUCH FUNCTION");;
				}
				$rv[] = $fnrv;
			} catch (Exception $ex) {
				$error_response = array(
					'tg-api-error' => $ex->getMessage(),
				);

				if ($adapter && $adapter->configuration['debug']) {
					$error_response['tg-api-trace'] = $ex->getTraceAsString();
				}
				$rv[] = $error_response;
			}
			$end = microtime(1);
			$times[] = $end - $start;
		}
		return [
			'return_values' => $rv,
			'timings' => $times
		];
	}


	function tg_api_has_rv($result) {
		foreach ($result['return_values'] as $rv) {
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
	}


	function tg_api_add_function_references(&$o) {

		// feature "removed" until we can
		//   a) make it stop "blowing" up serializations, and 
		//   b) secure it. (probably through signing and/or encryption)
		return;

		$method_names = get_class_methods($o);
		$target = serialize($o);
		foreach ($method_names as $method_name) {
			$o->{$method_name} = (object)array(
				'target' => 'o(' . $target . ').' . $method_name,
				'__types' => array('TG.FunctionReference' => 1),
				'api' => $_SERVER['REQUEST_URI'],
				'isEvent' => false
			);
		}
	}


	function tg_api_add_connection($token) {
		global $_tg_api_session_connections;
		$_SESSION[$_tg_api_session_connections][$token] = array(
			'connected' => microtime(1)
		);
		tg_api_prune_connections();
	}


	function tg_api_disconnect($token) {
		global $_tg_api_session_connections;
		if (isset($_SESSION[$_tg_api_session_connections][$token])) {
			$_SESSION[$_tg_api_session_connections][$token]['dc'] = true;
		}
	}


	function tg_api_disconnect_waiting($token) {
		global $_tg_api_session_connections;
		if (isset($_SESSION[$_tg_api_session_connections][$token])) {
			if (isset($_SESSION[$_tg_api_session_connections][$token]['dc'])) {
				return (bool)$_SESSION[$_tg_api_session_connections][$token]['dc'];
			}
		}
		return false;
	}


	function tg_api_prune_connections() {
		global $_tg_api_session_connections;
		foreach ($_SESSION[$_tg_api_session_connections] as $k => $v) {
			if ($v['connected'] + 30 < microtime(1)) {
				unset($_SESSION[$_tg_api_session_connections][$k]);
			}
		}
	}


?>
