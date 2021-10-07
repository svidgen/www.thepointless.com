<?php

	signout();
	redirect($base_url . preg_replace("/^\//", "", @$_GET['return']));

?>
