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
		</div>

	</div>

</form>

<script src='/js/auth.js'></script>
