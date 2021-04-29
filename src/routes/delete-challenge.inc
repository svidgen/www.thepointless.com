<?php

$meta_title = "deleting challenge ... ";

if (isset($_GET['id']) && isset($_GET['k'])) {
	$token = get_token($_GET['k']);
	if ($token == 'delete-challenge') {
		require_once('includes/game.inc');
		if (delete_challenge($_GET['id'])) {
			redirect("/profile");
		} else {
			print "Internal error. Try again, I guess!";
		}
	} else {
		print "Oops. jk!! Lulz ... try again?";
	}
} else {
	print "... or maybe not. Something defeinitely went wrong.<br /><br /><br />Try again, maybe?";
}

?>
