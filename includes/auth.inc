<?php

	// reasonable limits/defaults
	$default_salt_length = 16;
	$min_session_duration = 60 * 60;

	// make sure we're connected!
	require_once('includes/dbconnect.inc');


	function select_users($criteria, $options = array()) {
		if (isset($criteria['user_id']) && $criteria['user_id'] == 0) {
			return array(select_user(array('user_id' => 0)));
		}
		return my_select('users', $criteria, $options);
	} // select_users()



	// authenticate()
	// returns true if a user is authenticated; redirects to
	// signin page if user is not authenticated.
	function authenticate() {
		$config = get_config();

		$user = get_authenticated_user();
		if ($user) {
			return $user;
		} else {
			$redirect_page = merge_querystring(
				$config['signin_page'],
				"return=" . urlencode($_SERVER['REQUEST_URI'])
			);
			redirect($redirect_page);
		}
	} // authenticate()


	function signin($formdata) {
		$config = get_config();
		$base_url = $config['base_url'];

		$user = check_credentials($formdata);
		if ($user) {
			$stay_signed_in = @$formdata['stay_signed_in'];
			if (set_authenticated_user($user, $stay_signed_in)) {
				if (isset($_GET['return'])) {
					$redirect_page = $base_url . preg_replace("/^\//", "", $_GET['return']);
				} else {
					$redirect_page = $base_url;
				}
				redirect($redirect_page);
			} else {
				return "Internal error!";
			}
		} else {
			return "Bad credentials!";
		}
	} // signin()


	function signup($formdata) {
		$config = get_config();
		$base_url = $config['base_url'];

		if (preg_match('/^https?:\/\//', $formdata['username'], $m)) {
			return "Your username cannot be a URL.";
		}

		if (preg_match('/@/', $formdata['username'], $m)) {
			return "Your username cannot contain an @.";
		}

		$user = select_user(array('username' => $formdata['username']));
		if ($user) {
			return "That username is already in use!";
		} else {
			$user_id = insert_user(array(
				'username' => $formdata['username'],
				'password' => mycrypt($formdata['password'])
			));

			if ($user_id) {
				signin($formdata);
			} else {
				return "Internal error.";
			}
		}
	} // signup()


	function signout() {
		$config = get_config();
		unset($_SESSION[$config['atoken_name']]);
	} // signout()


	function get_user_id() {
		$user = get_authenticated_user();
		if ($user) {
			return $user['user_id'];
		} else {
			return 0;
		}
	} // get_user_id()


	function set_authenticated_user($user, $stay_signed_in = false) {
		$config = get_config();

		// generate and set a sub-session auth-token
		$atoken = sha1(mykeygen(128) . $user['username']);
		$_SESSION[$config['atoken_name']] = array(
			'token' => $atoken,
			'expires' => time() + $min_session_duration,
			'stay_signed_in' => $stay_signed_in,
			'user' => $user
		);

		send_auth_cookies();

		return true;
	} // set_authenticated_user()


	function refresh_local_user() {
		$config = get_config();
		$user_id = get_user_id();
		if ($user_id) {
			$user = select_user(array('user_id' => $user_id));
			$_SESSION[$config['atoken_name']]['user'] = $user;
		}
	} // set_local_user()


	function local_user() {
		$config = get_config();
		$atoken_name = $config['atoken_name'];
		if (isset($_COOKIE[$atoken_name]) && $_COOKIE[$atoken_name]) {
			if (isset($_SESSION[$atoken_name]) && $_SESSION[$atoken_name]['token'] == $_COOKIE[$atoken_name]) {
				// refresh authentication token cookie
				send_auth_cookies();

				// return the user ... 
				return @$_SESSION[$atoken_name]['user'];
			} else {
				return false;
			}
		} else {
			return false;
		}
	} // local_user()


	function get_authenticated_user() {
		return local_user();
	} // get_authenticated_user()


	function authenticated_user() {
		return get_authenticated_user();
	} // authenticated_user()


	function is_authenticated() {
		return get_authenticated_user();
	} // is_authenticated()


	function trim_user_fat($u) {
		$rv = $u;
		unset($rv['password']);
		unset($rv['userdata']);
		unset($rv['userdata_object']);
		return $rv;
	} // trim_user_fat()


	function is_admin($user = null) {
		if (!$user) {
			$user = get_authenticated_user();
		}
		return (bool)$user['admin'];
	} // is_admin()


	function require_admin($redirect = "index") {
		if (!is_admin()) {
			redirect($redirect);
		}
	} // require_admin()


	function base64UrlDecode($input) {
		return base64_decode(strtr($input, '-_', '+/'));
	}


	function send_auth_cookies() {
		global $min_session_duration, $auth_cookies_sent;
		$config = get_config();
		$atoken_name = $config['atoken_name'];
		$session_duration = $config['session_duration'];
		$cookie_domain = $config['cookie_domain'];

		// look for an atoken
		if (
			isset($_SESSION[$atoken_name])
			&& isset($_SESSION[$atoken_name]['token'])
			&& !$auth_cookies_sent
		) {
			// verify that the atoken is still valid
			if ($_SESSION[$atoken_name]['expires'] >= time()) {
				// it's valid -- refresh it.

				// determine when the atoken and cookie should expire
				if ($_SESSION[$atoken_name]['stay_signed_in']) {
					$expires = time() + $session_duration;
					$auth_cookie_duration = $expires;
				} else {
					$expires = time() + $min_session_duration;
					$auth_cookie_duration = 0;
				}

				$_SESSION[$atoken_name]['expires'] = $expires;
				$_COOKIE[$atoken_name] = $_SESSION[$atoken_name]['token'];

				// send the cookie -- but don't fuss if headers have
				// already been sent.
				@setcookie($atoken_name, $_SESSION[$atoken_name]['token'], $auth_cookie_duration, "/", $cookie_domain);
				$auth_cookies_sent = true;
			} else {
				// expired atoken. do signout stuff.
				signout();
			}
		}
	} // send_auth_cookies()


	// check_credentials()
	// checks a set of credentials.
	// returns a user record on success; false on failure.
	// calling code must be ready to handle thrown database exceptions.
	function check_credentials($formdata) {
		if (!@$formdata['username'] || !@$formdata['password']) {
			return false;
		}

		try {
			$intended_user = select_user(array('username' => $formdata['username']));
			$this_hash = mycrypt(
				@$formdata['password'],
				@$intended_user['password']
			);

			if ($this_hash == @$intended_user['password']) {
				return $intended_user;
			} else {
				return false;
			}
		} catch (Exception $e) {
			throw $e;
		}
	} // check_credentials()


	// mykeygen()
	// generates a random string, consisting of a-z, 0-9.
	// default length is 16 characters.
	function mykeygen($l = 0) {
		if ((int)$l < 1) {
			$l = 16;
		}
		
		$k = '';
		$vc = array_merge(range('a','z'), range(0,9));
		for ($i = 0; $i < $l; $i++) {
			$k .= $vc[array_rand($vc)];
		}

		return $k;
	} // mykeygen()


	// mycrypt()
	// NOTE: NEEDS TO BE REPLACED. ... Not that anything do we here needs to be
	// high security inherently. But, we should be using more secure hashing for
	// the sake of our users at this point.
	//
	// given a password, and optionally a salt, produces a password hash.
	// the characters of the passed in salt are used UP TO the first pipe,
	// if one exists.
	// results are length: hashsize + 1 + salt length
	// currently sha256: 64 + 1 + 16 = 81
	function mycrypt($p, $s = false) {
		global $default_salt_length;

		if (!$s) {
			$s = mykeygen($default_salt_length);
		} else {
			$parts = preg_split('/\|/', $s);
			$s = $parts[0];
		}

		$rv = $s . '|' . hash('sha256', $s . $p);

		return $rv;
	} // mycrypt()


	function user_menu($return_url = false) {
		if ($auth_user = authenticated_user()) {
			$signed_in_display = 'inline';
			$signed_out_display = 'none';
			$username = $auth_user['name'];


			$rv = "<div class='tpdc-user-menu' id='auth_signed_in'>
				<div>Hi <a style='display: inline;' href='/profile'>{$auth_user['name']}</a>.</div>
			";

			if (is_admin()) {
				$rv .= "<a href='/admin/'>Admin</a>\n";
			}

			$rv .= "
				<a href='/inbox'>Inbox
					<tpdc:unreadmessagecount></tpdc:unreadmessagecount>
				</a>
				<a href='/people'> . People</a>
				<a href='/quest-log'> . Quests</a>
				<a href='/inventory'> . Things</a>

				<div>
				<a href=\"" . signout_url($return_url)  . "\">Sign out</a></div>
				</div>
			";

		} else {
			$signed_in_display = 'none';
			$signed_out_display = 'inline';
			$username = '';
			$rv = "<a id='auth_signed_out' href=\"" . signin_url($return_url) . "\">Sign in / up</a>";
		}

		return $rv;

	} // user_menu()


	function signX_url($X, $return_url = false) {
		if (!$return_url) {
			$return_url = $_SERVER['REQUEST_URI'];
		}
		return "/sign{$X}?return=" . urlencode($return_url);
	} // signX_url()


	function signin_url($return_url = false) {
		return signX_url('in', $return_url);
	} // signin_url()


	function signout_url($return_url = false) {
		return signX_url('out', $return_url);
	} // signin_url()


?>
