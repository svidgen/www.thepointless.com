<?php

	$meta_title = "add a moment";

	$error_text = '';
	$proverb_text = isset($_POST['proverb_text']) ? $_POST['proverb_text'] : '';

	if (isset($_POST['add'])) {
		if (get_token($_POST['add']) == 'add_moment') {
			if (isset($_POST['tos']) && $_POST['tos'] == '1') {
				if (strlen($proverb_text) > 0 && strlen($proverb_text) <= 1000) {
					if ($proverb_id = insert_proverb('awkward-moment', $proverb_text)) {
						require_once('includes/game-inserts.inc');
						award_and_notify('Badge of Awkward', 1, 3);
						redirect("/awkward-moment");
					} else {
						$error_text = "Internal error! Please try again.";
					}
				} else {
					$error_text = "Must be between 1 and 1000 characters long!";
				}
			} else {
				$error_text = "You must agree to <a href='/terms' target='_blank'>our terms</a> first!";
			}
		} else {
			$error_text = "Invalid form submission!";
		}
	}

	$token = add_token('add_moment');

	$form = "
		<div class='error'>{$error_text}</div>
		<form name='add_moment' action='{$_SERVER['PHP_SELF']}' method='post'><div>
		<input type='hidden' name='add' value='{$token}' />
		<div>
			<table class='proverb_table'>
				<tr>
					<td colspan='3' class='proverb_leadin'>That awkward moment when</td>
				</tr>
				<tr>
					<td class='left_quote mark'>*</td>
					<td class='proverb_text'>
						<textarea name='proverb_text'>{$proverb_text}</textarea>
					</td>
					<td class='right_quote mark'>*</td>
				</tr>
				<tr>
					<td colspan='3'>
						<input type='checkbox' name='tos' value='1' /> I have read and agree to <a href='/terms' target='_blank'>the terms</a>.
					</td>
				</tr>
				<tr>
					<td colspan='3'>
						<input type='submit' value='Add It' />
						<a href='/awkward-moment'>Cancel</a>
					</td>
				</tr>
			</table>
		</div>
		</div></form>
	";
?>
<?php print $form; ?>
