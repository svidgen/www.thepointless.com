<?php

	$meta_title = "edit profile";

	//
	// need to have a non-FB user!
	//
	$user = authenticate();
	$user['userdata'] = json_decode($user['userdata'], 1);
	if (!is_array($user['userdata'])) {
		$user['userdata'] = array();
	}

	// print "<pre>" . print_r($user, 1) . "</pre>";

	if (preg_match("/^http(s)?:\/\/graph.facebook.com/", $user['username'])) {

		print "<div>thepointless.com uses your <a href='https://facebook.com/' target='_blank'>facebook</a> profile. <a href='https://facebook.com' target='_blank'>Head over there</a> to edit it.</div>";
		print "<br /><div>Or, just <a href='/profile'>return to your profile</a>.</div>";
		return 1;

		/*
		// not sure i want to redirect automatically ... 
		// 
		if (isset($user['userdata']['link'])) {
			redirect($user['userdata']['link']);
		} else {
			redirect("https://facebook.com");
		}
		*/
	}


	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	$errors = array();
	if (isset($_POST['edit']) && get_token($_POST['edit']) == "edit-profile") {

		// take care of "basic" fields
		$user['userdata']['bio'] = $_POST['bio'];
		$user['userdata']['icon_id'] = @$_POST['icon_id'];


		// process icon uploads
		if (isset($_FILES['icon']) && $_FILES['icon']['name']) {

			$image_types = array(
				'image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif'
			);

			if (in_array($_FILES['icon']['type'], $image_types)) {
				if ($_FILES['icon']['size'] < 1024 * 1024) {
					$image_data = file_get_contents($_FILES['icon']['tmp_name']);
					$image_row = build_image_row($_FILES['icon']['type'], $image_data, 200, 200);
					$user['userdata']['icon_id'] = insert_image($image_row);
				} else {
					$errors[] = "Icon file size must not exceed 1MB.";
				}
			} else {
				$errors[] = "Invalid file type. jpeg, png, bmp, and gif's are accepted.";
			}
		} else {
			// print "not icon. ";
		}

		$user['userdata'] = json_encode($user['userdata']);

		if (sizeof($errors) == 0) {
			try {
				if ($user['user_id']) {
					$saved = update_user($user);
					refresh_local_user();
				} else {
					$errors[] = "No user to save.";
				}
			} catch (Exception $e) {
				$errors[] = $e->getMessage();
				$saved = false;
			}

			if ($saved) {
				redirect("/profile");
			} else {
				if (sizeof($errors) > 0) {
					print join($errors, "<br />");
					print "<br />Please try again.";
				} else {
					print "Unknown error. Please try again.";
				}
				print_form($user);
			}
		} else {
			print join($errors, "<br />");
			print_form($user);
		}


		// ... this needs to be done.
		// $user['things'] = $_POST['things'];
		// $user['actions'] = $_POST['actions'];
		
	} else {
		print_form($user);
	}



	function print_form($u) {
		$key = add_token("edit-profile");

		$d = $u['userdata'];

		if (@$d['icon_id'] > 0) {
			$existing_image = "<img src='/d-image?id={$d['icon_id']}' /><br />";
		} else {
			$d['icon_id'] = 0;
			$existing_image = "";
		}

		$bio = isset($_POST['bio']) ? htmlsafe($_POST['bio']) : htmlsafe(@$d['bio']);

		print "
			<form name='edit-user' action='{$_SERVER['PHP_SELF']}' method='post' enctype='multipart/form-data'>
				<input type='hidden' name='edit' value='{$key}' />
				<input type='hidden' name='icon_id' value='{$d['icon_id']}' />
				<table style='width: 90%;'>
					<tr>
						<td><b>Icon</b></td>
						<td>
							{$existing_image}
							<input type='file' name='icon' accept='image/*' />
							<div style='font-size: smaller;'>(Will be scaled to fit within 200x200<sup title='Uploading an image that is already 200x200 avoids degradation due to scaling and format conversion.' style='cursor: default;'>?</sup>)</div>
						</td>
					</tr>

					<tr>
						<td><b>Bio</b></td>
						<td><textarea name='bio' style='width: 100%; height: 250px;'>{$bio}</textarea></td>
					</tr>

						<td></td>
						<td style='text-align: right;'>
							<input type='submit' value='Save.' />
							<a href='/profile'>Cancel</a>
						</td>
					</tr>

				</table>
			</form>
		";
	} // print_form()

?>
