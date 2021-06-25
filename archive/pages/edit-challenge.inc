<?php

	// process no further if the signed-in user is not an admin.
	require_admin();

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	$errors = array();
	$challenge = array(
		'challenge_id' => '',
		'title' => '',
		'details' => '',
		'icon_id' => ''
	);
	$meta_title = "create challenge";

	if (isset($_POST['edit']) && get_token($_POST['edit']) == "edit-challenge") {

		// take care of "basic" fields
		$challenge['challenge_id'] = $_POST['challenge_id'];
		$challenge['title'] = $_POST['title'];
		$challenge['details'] = $_POST['details'];
		$challenge['repeatable'] = @$_POST['repeatable'];
		$challenge['icon_id'] = @$_POST['icon_id'];

		// parse and insert turn-ins
		$challenge['things'] = array_merge(
			things_array($_POST['turnins'], true),
			things_array($_POST['rewards'], false)
		);


		// process icon uploads
		if (isset($_FILES['icon']) && $_FILES['icon']['name']) {

			$image_types = array(
				'image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif'
			);

			if (in_array($_FILES['icon']['type'], $image_types)) {
				if ($_FILES['icon']['size'] < 200 * 1024) {
					$image_data = file_get_contents($_FILES['icon']['tmp_name']);
					$image_row = build_image_row($_FILES['icon']['type'], $image_data, 128, 128);
					$challenge['icon_id'] = insert_image($image_row);
				} else {
					$errors[] = "Icon file size must not exceed 200kb.";
				}
			} else {
				$errors[] = "Invalid file type. jpeg, png, bmp, and gif's are accepted.";
			}
		} else {
			// print "not icon. ";
		}

		if (sizeof($errors) == 0) {
			try {
				if ($challenge['challenge_id']) {
					$saved = update_challenge($challenge);
				} else {
					$saved = insert_challenge($challenge);
					$challenge['challenge_id'] = $saved;
				}
			} catch (Exception $e) {
				$errors[] = $e->getMessage();
				$saved = false;
			}

			if ($saved) {
				// print "Challenged saved. <a href='{$_SERVER['PHP_SELF']}'>Create another.</a>";
				// print_form($challenge);
				redirect("/challenge?id={$challenge['challenge_id']}");
			} else {
				if (sizeof($errors) > 0) {
					print join($errors, "<br />");
					print "<br />Please try again.";
				} else {
					print "Unknown error. Please try again.";
				}
				print_form($challenge);
			}
		} else {
			print join($errors, "<br />");
			print_form($challenge);
		}


		// ... this needs to be done.
		// $challenge['things'] = $_POST['things'];
		// $challenge['actions'] = $_POST['actions'];
		
	} else {
		if (@$_GET['id'] > 0) {
			$challenges = select_challenges(array('challenge_id' => $_GET['id']));
			if (sizeof($challenges) > 0) {
				$challenge = $challenges[0];
				$challenge['things'] = select_challenge_things(
					$challenge['challenge_id']
				);
			}
		}

		if ($challenge['challenge_id'] > 0) {
			$meta_title = "alter challenge";
		}

		print_form($challenge);
	}



	function print_form($c) {
		$key = add_token("edit-challenge");

		if (@$c['icon_id'] > 0) {
			$existing_image = "<img src='/d-image?id={$c['icon_id']}' /><br />";
		} else {
			$existing_image = "";
		}

		if (@$c['repeatable']) {
			$repeatable_checked = "checked='checked'";
		} else {
			$repeatable_checked = '';
		}

		if (isset($_GET['return'])) {
			$return_url = $_GET['return'];
		} else {
			$return_url = "profile";
		}

		$details = htmlsafe($c['details']);

		if (isset($c['things']) && is_array($c['things'])) {
			$turnins = challenge_turnins($c);
			$rewards = challenge_rewards($c);
		} else {
			$turnins = array();
			$rewards = array();
		}

		$title = htmlsafe($c['title']);

		$turnins = htmlsafe(things_string($turnins, 1, 0, 0));
		$rewards = htmlsafe(things_string($rewards, 1, 0, 0));

		print "
			<form name='edit-challenge' action='{$_SERVER['PHP_SELF']}' method='post' enctype='multipart/form-data'>
				<input type='hidden' name='edit' value='{$key}' />
				<input type='hidden' name='challenge_id' value='{$c['challenge_id']}' />
				<input type='hidden' name='icon_id' value='{$c['icon_id']}' />
				<table style='width: 90%;'>
					<tr>
						<td><b>Title</b></td>
						<td><input type='text' name='title' value='{$title}' style='width: 100%;'/></td>
					</tr>

					<tr>
						<td><b>Icon</b></td>
						<td>
							{$existing_image}
							<input type='file' name='icon' accept='image/*' />
							<div style='font-size: smaller;'>(Will be scaled to fit within 128x128<sup title='Uploading an image that is already 128x128 avoids degradation due to scaling and format conversion.' style='cursor: default;'>?</sup>)</div>
						</td>
					</tr>

					<tr>
						<td><b>Details</b></td>
						<td><textarea name='details' style='width: 100%; height: 250px;'/>{$details}</textarea></td>
					</tr>

					<tr>
						<td><b>Turn-ins</b></td>
						<td><input type='text' name='turnins' value=\"{$turnins}\" style='width: 100%;' />
					</tr>

					<tr>
						<td><b>Rewards</b></td>
						<td><input type='text' name='rewards' value=\"{$rewards}\" style='width: 100%;' />
					</tr>

					<tr>
						<td><b>Repeatable</b></td>
						<td><input type='checkbox' name='repeatable' value='1' {$repeatable_checked} /></td>

					<tr>
						<td></td>
						<td style='text-align: right;'>
							<input type='submit' value='Save it.' />
							<a href='{$return_url}'>Cancel</a>
						</td>
					</tr>

				</table>
			</form>
		";
	} // print_form()

?>
