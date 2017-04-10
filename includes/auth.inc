<?php

	// settings
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
		global $signin_page;

		$user = get_authenticated_user();
		if ($user) {
			return $user;
		} else {
			$redirect_page = merge_querystring(
				$signin_page, "return=" . urlencode($_SERVER['REQUEST_URI'])
			);
			redirect($redirect_page);
		}
	} // authenticate()


	function signin($formdata) {
		global $base_url;
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
		global $base_url;

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
		global $auth_user_name, $atoken_name;
		unset($_SESSION[$atoken_name]);
		facebook_signout();
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
		global $auth_user_name, $atoken_name, $min_session_duration;

		// generate and set a sub-session auth-token
		$atoken = sha1(mykeygen(128) . $user['username']);
		$_SESSION[$atoken_name] = array(
			'token' => $atoken,
			'expires' => time() + $min_session_duration,
			'stay_signed_in' => $stay_signed_in,
			'user' => $user
		);

		send_auth_cookies();

		return true;
	} // set_authenticated_user()


	function refresh_local_user() {
		global $atoken_name;
		$user_id = get_user_id();
		if ($user_id) {
			$user = select_user(array('user_id' => $user_id));
			$_SESSION[$atoken_name]['user'] = $user;
		}
	} // set_local_user()


	function local_user() {
		global $atoken_name;
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
		$fb_user = facebook_user();
		$local_user = local_user();

		if ($fb_user) {
			if (!$local_user) {
			}

			$local_user['userdata_object'] = $fb_user;
		}

		return $local_user;
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


	function facebook_signout() {
		global $facebook_appId, $facebook_cookie_domain;
		unset($_SESSION['facebook_user']);
	} // facebook_signout()


	function base64UrlDecode($input) {
		return base64_decode(strtr($input, '-_', '+/'));
	}


	function facebook_user() {
		global $facebook_appId, $facebook_appSecret, $base_url;

		// check for the existence of the facebook cookie
		if (isset($_COOKIE['fbsr_' . $facebook_appId])) {

			list($encoded_sig, $payload) = explode('.', $_COOKIE['fbsr_' . $facebook_appId], 2);

			// decode the data
			$sig = base64UrlDecode($encoded_sig);
			$fb_cookie = json_decode(base64UrlDecode($payload), true);

			if (strtoupper($fb_cookie['algorithm']) !== 'HMAC-SHA256') {
				return false;
			}

			// check sig
			$expected_sig = hash_hmac('sha256', $payload, $facebook_appSecret, $raw = true);
			if ($sig !== $expected_sig) {
				return false;
			}

			if (!is_array(@$_SESSION['facebook_user'])
				|| @$_SESSION['facebook_user']['id'] != $fb_cookie['user_id'])
			{

				$_SESSION['facebook_user'] = array();

                // grab the facebook access token
                // if (!$_SESSION['facebook_user']['access_token']) {
                    $token_url = "https://graph.facebook.com/oauth/access_token?client_id={$facebook_appId}&redirect_uri=&client_secret={$facebook_appSecret}&code={$fb_cookie['code']}";
                    $curl_handle = curl_init();
                    curl_setopt($curl_handle, CURLOPT_URL, $token_url);
                    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
                    $access_token = curl_exec($curl_handle);
					$_SESSION['fb_access_token'] = $access_token;
				// }


				$fb_me_url = "https://graph.facebook.com/me?{$access_token}";

				// cURL is noticeably faster than file_get_contents()
				$curl_handle = curl_init();
				curl_setopt($curl_handle, CURLOPT_URL, $fb_me_url);
				curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
				$fb_user_json = curl_exec($curl_handle);


				// parse the response and make sure the fields we care about
				// are there.
				$fb_user = json_decode($fb_user_json, true);
				if (@!$fb_user['id']) {
					return false;
				}

				// toss the FB user in the session
				$_SESSION['facebook_user'] = $fb_user;
				$_SESSION['facebook_user']['access_token'] = $access_token;

			} else {
				$fb_user = $_SESSION['facebook_user'];
			}


			$local_user = local_user();
			if (!$local_user) {
				// look for a local record for the FB account
				$local_user = select_user(
					array(
						'username' => "http://graph.facebook.com/{$fb_user['id']}"
					)
				);


				if ($local_user) {
					$local_user['name'] = $fb_user['name'];
					if (isset($fb_user_json)) {
						$local_user['userdata'] = $fb_user_json;
					}
					update_user($local_user);
				} else {
					$local_user = array(
						'username' => "http://graph.facebook.com/{$fb_user['id']}",
						'password' => '',
						'name' => $fb_user['name'],
					);

					if (isset($fb_user_json)) {
						$local_user['userdata'] = $fb_user_json;
					}

					$user_id = insert_user($local_user);
					$local_user['user_id'] = $user_id;
				}

				if (isset($fb_user_json)) {
					$local_user['userdata'] = $fb_user_json;
				}

				// add the local user record to the session
				set_authenticated_user($local_user);
			}

			return $fb_user;

		} else {
			return false;
		}

	} // facebook_user()


	function get_facebook_user() {
		return facebook_user();
	} // get_facebook_user()


	function authenticated_facebook_user() {
		return facebook_user();
	} // authenticated_facebook_user()


	function send_auth_cookies() {
		global $atoken_name, $session_duration, $min_session_duration, $cookie_domain, $auth_cookies_sent;

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


	function facebook_auth_html() {

	} // facebook_auth_html()


?>
