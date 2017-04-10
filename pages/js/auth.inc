function fb_signin(return_path) {
	var fbid = "<?php print $facebook_appId; ?>";

	FB.login(function(response) {
		if (response.authResponse) {
			if (response.scope) {
				// user is logged in and granted some permissions.
				// perms is a comma separated list of granted permissions
				document.location = return_path;
			} else {
				// user is logged in, but did not grant any permissions
				document.location = return_path;
			}
		} else {
			// user is not logged in
		}

		// document.getElementById('debug_out').innerHTML = print_r(response);
	}, {scope:'user_about_me'});  // {scope:'publish_stream'});
} // fb_signin()


function fb_authenticated_user() {
	FB.getLoginStatus(function(response) {
		if (response.authResponse) {
			// logged in and connected user, someone you know
			return true;
		} else {
			// no user session available, someone you dont know
			return false;
		}
	});
} // fb_authenticated_user()


