<?php

	if ($user = authenticated_user()) {
		if (isset($_GET['return'])) {
			redirect($base_url . preg_replace('/^\//', '', $_GET['return']));
		} else {
			redirect($base_url);
		}
	}

	if (isset($_POST['sign'])) {
		if ($_POST['sign'] == 'in') {
			$error = signin($_POST);
		} elseif ($_POST['sign'] == 'up') {
			$error = signup($_POST);
		}
	} else {
		// $error = 'hmmm ... ';
	}

	if (isset($error)) {
		$error = "<div style='color: #aa0000; font-weight: bold; font-size: large; margin-bottom: 1em; text-decoration: underline;'>{$error}</div>";
	} else {
		$error = '';
	}


	$placeholders = array(
		array(
			'username' => 'Mister-T',
			'password' => 'my mohawk rocks'
		)
	);

	$this_placeholder = $placeholders[array_rand($placeholders)];
	$username_placeholder = $this_placeholder['username'];
	$password_placeholder = $this_placeholder['password'];


	$meta_title = "sign in ... or up";

?>
Because why not?
<form name='signin' action='<?php print $_SERVER['REQUEST_URI']; ?>' method='post'>

	<div style='border: 1px solid silver; margin: 20px; padding: 20px;'>
		<?php print $error; ?>

		Your <input type='radio' name='sign' value='up' /><b>new</b>
		or <input type='radio' name='sign' value='in' checked='checked' /><b>existing</b>
		credentials go here:

		<br /><br/ >

		<input type='hidden' name='signin' value='1' />

		<table>

			<tr>
				<td>Username</td>
				<td><input type='text' name='username' value="<?php print isset($_POST['user']) ? $_POST['user'] : '' ; ?>" placeholder="<?php print $username_placeholder;  ?>" /></td>
			</tr>

			<tr>
				<td>Password</td>
				<td><input type='password' name='password' placeholder="<?php print $password_placeholder; ?>" /></td>
			</tr>

		</table>


		<br /><input type='checkbox' name='stay_signed_in' value='1' <?php print isset($_POST['stay_signed_in']) ? 'checked="checked"' : ''; ?> />Stay signed in.
		<input type='submit' value='Sign In' />

		<div id='fb_signin_div' style='display: none; text-align: center; margin: 25px;'>
			<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: 24pt; margin: 25px; color: #55aa55; font-style: italic;'>OR</div>
			<a href='#fb_signin' id='fb_signin_link' onclick='fb_signin("<?php print @$_GET['return']; ?>");' class='facebook'><span>Use Facebook</span></a>
		</div>

	</div>

</form>

<script src='https://connect.facebook.net/en_US/all.js'></script>
<script src='/js/auth.js'></script>
<script>
	document.getElementById('fb_signin_div').style.display = 'block';

	FB.init({
		appId: '<?php print $facebook_appId; ?>',
		channelUrl: '<?php print $base_url; ?>fbchannel.html',
		status: true,
		cookie: true,
		xfbml: true,
		oauth: true
	});

	FB.Event.subscribe('auth.statusChange', function() {
		var auth_user = document.createElement('script');
		auth_user.src = '/ajax/authenticated_user.js?cb=TPDC.setUserMenu&return=' + document.location;
		auth_user.type = 'text/javascript';
		document.body.appendChild(auth_user);
	});
</script>
