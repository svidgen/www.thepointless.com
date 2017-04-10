<?php

	$meta_title = "edit thing";

	//
	// need to have a non-FB thing!
	//
	$user = authenticate();
	if (!is_admin($user)) {
		redirect("/thing?id={$thing['thing_id']}");
	}

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	$thing = array();
	$errors = array();
	if (isset($_POST['edit']) && get_token($_POST['edit']) == "edit-thing") {

		// take care of "basic" fields
		$thing['thing_id'] = $_POST['thing_id'];
		$thing['details'] = $_POST['details'];
		$thing['icon_id'] = @$_POST['icon_id'];
		$thing['max_per_award'] = $_POST['max_per_award'];
		$thing['min_award_delay'] = $_POST['min_award_delay'];


		// process icon uploads
		if (isset($_FILES['icon']) && $_FILES['icon']['name']) {

			$image_types = array(
				'image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif', 'image/svg+xml'
			);

			if (in_array($_FILES['icon']['type'], $image_types)) {
				if ($_FILES['icon']['size'] < 1024 * 1024) {
					$image_data = file_get_contents($_FILES['icon']['tmp_name']);
					$image_row = build_image_row($_FILES['icon']['type'], $image_data, 128, 128);
					$thing['icon_id'] = insert_image($image_row);
				} else {
					$errors[] = "Icon file size must not exceed 1MB.";
				}
			} else {
				$errors[] = "Invalid file type. svg, jpeg, png, bmp, and gif's are accepted.";
			}
		} else {
			// print "not icon. ";
		}

		if (sizeof($errors) == 0) {
			try {
				if ($thing['thing_id']) {
					$saved = my_update('things', 'thing_id', $thing);
				} else {
					$errors[] = "No<i>thing</i> to save.";
				}
			} catch (Exception $e) {
				$errors[] = $e->getMessage();
				$saved = false;
			}

			if ($saved) {
				redirect("/thing?id={$thing['thing_id']}");
			} else {
				if (sizeof($errors) > 0) {
					print join($errors, "<br />");
					print "<br />Please try again.";
				} else {
					print "Unknown error. Please try again.";
				}
				print_form($thing);
			}
		} else {
			print join($errors, "<br />");
			print_form($thing);
		}


		// ... this needs to be done.
		// $thing['things'] = $_POST['things'];
		// $thing['actions'] = $_POST['actions'];
		
	} else {
		if (@$_GET['id'] > 0) {
			$things = select_things(array('thing_id' => $_GET['id']));
			if (sizeof($things) > 0) {
				$thing = $things[0];
			}
		}

		print_form($thing);
	}



	function print_form($t) {
		$key = add_token("edit-thing");

		if (@$t['icon_id'] > 0) {
			$existing_image = "<img src='/d-image?id={$t['icon_id']}' /><br />";
		} else {
			$t['icon_id'] = 0;
			$existing_image = "";
		}

		$details = htmlsafe(@$t['details']);

		print "
			<form name='edit-thing' action='{$_SERVER['PHP_SELF']}' method='post' enctype='multipart/form-data'>
				<input type='hidden' name='edit' value='{$key}' />
				<input type='hidden' name='thing_id' value='{$t['thing_id']}' />
				<input type='hidden' name='icon_id' value='{$t['icon_id']}' />
				<table style='width: 90%;'>
					<tr>
						<td><b>Thing</b></td>
						<td>{$t['name']}</td>
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
						<td><b>Maximum per award</b></td>
						<td><input type='text' name='max_per_award' value=\"{$t['max_per_award']}\" /></td>
					</tr>
					<tr>
						<td><b>Minimum delay between awards</b></td>
						<td><input type='text' name='min_award_delay' value=\"{$t['min_award_delay']}\" /></td>
					</tr>

					<tr>
						<td><b>Details</b></td>
						<td><textarea name='details' style='width: 100%; height: 250px;'/>{$details}</textarea></td>
					</tr>

						<td></td>
						<td style='text-align: right;'>
							<input type='submit' value='Save.' />
							<a href='/thing?id={$t['thing_id']}'>Cancel</a>
						</td>
					</tr>

				</table>
			</form>
		";
	} // print_form()

?>
