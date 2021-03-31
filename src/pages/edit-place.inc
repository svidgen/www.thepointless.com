<?php

	$meta_title = "edit place";

	//
	// need to have a non-FB place!
	//
	$user = authenticate();
	if (!is_admin($user)) {
		redirect("/place?id={$place['place_id']}");
	}

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	if (isset($_POST['link_to'])) {
		$link_to = (int)$_POST['link_to'];
	} elseif (
		isset($_GET['link_to'])
		&& can_link_to_place(array('place_id' => $_GET['link_to']))
	) {
		$link_to = (int)$_GET['link_to'];
	} else {
		$link_to = null;
	}

	$place = array(
		'place_id' => '',
		'name' => '',
		'details' => '',
		'icon_id' => '',
		'link_to' => $link_to
	);

	$errors = array();
	if (isset($_POST['edit']) && get_token($_POST['edit']) == "edit-place") {

		// take care of "basic" fields
		$place['place_id'] = $_POST['place_id'];
		$place['name'] = $_POST['name'];
		$place['details'] = $_POST['details'];
		$place['icon_id'] = @$_POST['icon_id'];


		// process icon uploads
		if (isset($_FILES['icon']) && $_FILES['icon']['name']) {

			$image_types = array(
				'image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif'
			);

			if (in_array($_FILES['icon']['type'], $image_types)) {
				if ($_FILES['icon']['size'] < 1024 * 5120) { 	// 5MB
					$image_data = file_get_contents($_FILES['icon']['tmp_name']);
					$image_row = build_image_row($_FILES['icon']['type'], $image_data, 256, 256);
					$place['icon_id'] = insert_image($image_row);
				} else {
					$errors[] = "Icon file size must not exceed 1MB.";
				}
			} else {
				$errors[] = "Invalid file type. jpeg, png, bmp, and gif's are accepted.";
			}
		} else {
			// print "not icon. ";
		}
		

		if (sizeof($errors) == 0) {
			try {
				$ok = my_start_transaction();
				if (!$ok) throw new Exception("Could not start transaction.");

				if ($place['place_id']) {
					$saved = update_place($place);
				} else {
					$saved = insert_place($place);
					$place['place_id'] = $saved;
				}

				if (!$saved) {
					my_rollback();
					throw new Exception("Could not save place.");
				}

				if ($place['link_to']) {
					$linked_place = select_place((int)$place['link_to']);
					if ($linked_place) {
						$ok = link_places($linked_place,
							array('place_id' => $saved)
						);
					} else {
						$saved = false;
						throw new Exception("Could not find place {$place['link_to']}.");
					}
				}

				if (!$ok) {
					$saved = false;
					throw new Exception("Could not link places.");
				}

				if (!my_commit()) {
					$saved = false;
					throw new Exception("Could not commit changes to database.");
				}
					
			} catch (Exception $e) {
				$errors[] = $e->getMessage();
				$saved = false;
			}

			if ($saved) {
				redirect("/place?id={$place['place_id']}");
			} else {
				if (sizeof($errors) > 0) {
					print join($errors, "<br />");
					print "<br />Please try again.";
				} else {
					print "Unknown error. Please try again.";
				}
				print_form($place);
			}
		} else {
			print join($errors, "<br />");
			print_form($place);
		}


		// ... this needs to be done.
		// $place['places'] = $_POST['places'];
		// $place['actions'] = $_POST['actions'];
		
	} else {
		if (@$_GET['id'] > 0) {
			$places = select_places(array('place_id' => $_GET['id']));
			if (sizeof($places) > 0) {
				$place = $places[0];
				$place['link_to'] = null;
			}
		}

		print_form($place);
	}



	function print_form($p) {
		$key = add_token("edit-place");

		if (@$p['icon_id'] > 0) {
			$existing_image = "<img src='/d-image?id={$p['icon_id']}' /><br />";
		} else {
			$p['icon_id'] = 0;
			$existing_image = "";
		}

		$details = htmlsafe(@$p['details']);
		$name = htmlsafe(@$p['name']);

		$return_id = $p['link_to'] ? $p['link_to'] : $p['place_id'];

		print "
			<form name='edit-place' action='{$_SERVER['PHP_SELF']}' method='post' enctype='multipart/form-data'>
				<input type='hidden' name='edit' value='{$key}' />
				<input type='hidden' name='place_id' value='{$p['place_id']}' />
				<input type='hidden' name='icon_id' value='{$p['icon_id']}' />
				<input type='hidden' name='link_to' value='{$p['link_to']}' />
				<table style='width: 90%;'>
					<tr>
						<td><b>Place</b></td>
						<td><input type='text' name='name' value=\"{$name}\" style='width: 100%;' /></td>
					</tr>
					<tr>
						<td><b>Icon</b></td>
						<td>
							{$existing_image}
							<input type='file' name='icon' accept='image/*' />
							<div style='font-size: smaller;'>(Will be scaled to fit within 256x256<sup title='Uploading an image that is already 256x256 avoids degradation due to scaling and format conversion.' style='cursor: default;'>?</sup>)</div>
						</td>
					</tr>

					<tr>
						<td><b>Details</b></td>
						<td><textarea name='details' style='width: 100%; height: 250px;'/>{$details}</textarea></td>
					</tr>

						<td></td>
						<td style='text-align: right;'>
							<input type='submit' value='Save.' />
							<a href='/place?id={$return_id}'>Cancel</a>
						</td>
					</tr>

				</table>
			</form>
		";
	} // print_form()

?>
