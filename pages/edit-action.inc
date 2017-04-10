<?php

	// process no further if the signed-in user is not an admin.
	require_admin();

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');

	$errors = array();
	$action = array(
		'action_id' => '',
		'name' => '',
		'reagents' => array(),
		'products' => array()
	);
	$meta_title = "create action";

	if (@$_GET['things']) {
		$things = preg_split("/,/", $_GET['things']);
		if (sizeof($things) > 1) {
			$thing_a = select_thing($things[0]);
			$thing_a['quantity'] = -1;

			$thing_b = select_thing($things[1]);
			$thing_b['quantity'] = -1;

			$actions = select_things_action(array($thing_a, $thing_b));
			if (sizeof($actions) > 0) {
				$action = $actions[0];
			} else {
				$action['reagents'] = array($thing_a, $thing_b);
			}
		}
	}

	if (isset($_POST['edit']) && get_token($_POST['edit']) == "edit-action") {

		// take care of "basic" fields
		$action['action_id'] = $_POST['action_id'];
		$action['name'] = @$_POST['name'];

		// parse and insert turn-ins
		// $action['reagents'] = things_array(@$_POST['reagents'], true);
		$action['products'] = things_array(@$_POST['products'], false);

		if (sizeof($errors) == 0) {
			try {
				if ($action['action_id']) {
					$saved = update_action($action);
				} else {
					$saved = insert_action($action);
					$action['action_id'] = $saved;
				}
			} catch (Exception $e) {
				$errors[] = $e->getMessage();
				$saved = false;
			}

			if ($saved) {
				if (isset($_GET['return'])) {
					redirect($_GET['return']);
				} else {
					redirect("/action?id={$action['action_id']}");
				}
			} else {
				if (sizeof($errors) > 0) {
					print join($errors, "<br />");
					print "<br />Please try again.";
				} else {
					print "Unknown error. Please try again.";
				}
				print_form($action);
			}
		} else {
			print join($errors, "<br />");
			print_form($action);
		}

	} else {
		if (@$_GET['id'] > 0) {
			$actions = select_actions(array('action_id' => $_GET['id']));
			if (sizeof($actions) > 0) {
				$action = $actions[0];
			}
		}

		if ($action['action_id'] > 0) {
			$meta_title = "alter action";
		}

		print_form($action);
	}



	function print_form($c) {
		$key = add_token("edit-action");

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

		$name = htmlsafe($c['name']);
		$reagents = htmlsafe(things_string($c['reagents'], 1, 0, 0));
		$products = htmlsafe(things_string($c['products'], 1, 0, 0));

		print "
			<form name='edit-action' action='{$_SERVER['REQUEST_URI']}' method='post' enctype='multipart/form-data'>
				<input type='hidden' name='edit' value='{$key}' />
				<input type='hidden' name='action_id' value='{$c['action_id']}' />
				<table style='width: 90%;'>
					<tr>
						<td style='width: 120px;'><b>Action Name</b></td>
						<td><input type='text' name='name' value='{$name}' style='width: 100%;'/></td>
					</tr>

					<tr>
						<td><b>Reagents</b></td>
						<td><input type='text' name='reagents' value=\"{$reagents}\" style='width: 100%;' disabled='disabled' />
					</tr>

					<tr>
						<td><b>Products</b></td>
						<td><input type='text' name='products' value=\"{$products}\" style='width: 100%;' />
					</tr>

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
