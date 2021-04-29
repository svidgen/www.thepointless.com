<?php

	require_once('includes/auth.inc');
	require_admin();

	$meta_title = "award things";

	if (isset($_POST['token'])
		&& get_token($_POST['token']) == 'admin-award-thing'
	) {
		$ok = false;
		$user = false;
		$rows = select_users(array('username' => $_POST['username']));

		if (sizeof($rows) == 1) {
			$user = $rows[0];
		} elseif (sizeof($rows) > 1) {
			$possibles = $users;
		} else {
			$rows = select_users(array('name' => $_POST['username']));
			if (sizeof($rows) == 1) {
				$user = $rows[0];
			}
		}

		if ($user) {
			require_once('includes/game.inc');
			$ok = add_user_thing(
				array(
					'name' => $_POST['thing'],
					'quantity' => $_POST['quantity']
				),
				$user['user_id'],
				'a secret place',
				'/index'
			);
		}

		if ($ok) {
			print "<div>Awarded ...</div>";
		} else {
			print "<div>NOT OK!</div>";
		}

		if (isset($possibles)) {
			print "<div>Multiple users matched.</div><div>";
			foreach ($possibles as $user) {
				print "<div>ahhhhhh</div>";
			}
			print "</div>";
		}
	}

	$username = isset($_GET['username']) ? $_GET['username'] : '';
	$username = urlencode($username);
	$token = add_token('admin-award-thing');

?>
<form action='<?php print $_SERVER['PHP_SELF']; ?>' method='post'>
	<table>
		<tr>
			<td><b>User</b></td>
			<td><input type='text' name='username' value="<?php print $username; ?>" /></td>
		</tr>
		<tr>
			<td><b>Thing</b></td>
			<td><input type='text' name='thing' /></td>
		</tr>
		<tr>
			<td><b>Qty</b></td>
			<td><input type='text' name='quantity' /></td>
		</tr>
	</table>
	<div>
		<input type='hidden' name='token' value='<?php print $token; ?>' />
		<input type='submit' value='Submit' />
	</div>
</form>
