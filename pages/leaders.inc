<?php

	$meta_title = "leaders";

	$leaders = my_select(

		// table
		join(' ', array(
			'user_thing ut',
			'left join users u on (u.user_id=ut.user_id)',
			'left join things t on (t.thing_id=ut.thing_id)'
		)),

		// object | conditions
		array(
		
		),

		// options
		array(
			'limit' => array('count' => 25),
			'order' => 'ut.quantity desc'
		)

	);

	print "<pre>";
	print_r($leaders);
	print "</pre>";

?>
