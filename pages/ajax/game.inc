<?php

	require_once('includes/game.inc');

	$require_theme = "jsonp";

	$gamekey = false;
	$action = false;

	if (isset($_GET['o'])) {
		$o = json_decode($_GET['o'], 1);
	} else {
		$o = array();
	}

	if (isset($o['token'])) {
		$action = get_token($o['token']);
		switch ($action['action']) {
			case 'award':
				$total_qty = 0;

				if (isset($o['item']) && isset($o['quantity'])) {
					$awards = array($o);
				} else if (isset($o['items'])) {
					$awards = $o['items'];
				}

				$awarded = array();
				foreach ($awards as $a) {
					foreach ($action['caps'] as $k => $c) {
						if ($c['thing'] == $a['item']) {
							$qty = award($a['item'], $a['quantity'], $c, $action['page_title'], $action['url']);
							if ($qty > 0) {
								$awarded[$a['item']] = $qty;
								$total_qty += $qty;
							}
							$action['caps'][$k] = $c;
							break;
						}
					}
				}

				$new_token = add_token($action);
				$json_response = json_encode(array(
					'quantity' => $total_qty,
					'awarded' => $awarded,
					'new_token' => $new_token
				));
				break;

			default:
				$json_response = json_encode("Nothing.");
				// do nothing.
				break;
		}

	} else {
		$json_response = json_encode("errmm ... ");
	}

	/*
	if ($action) {
		// create a new key for the action
		$gamekey = add_key($action);
	}
	*/

	// $json_debug = print_r($action, 1);

?>
