<?php

	$require_theme = 'php';

	send_cache_control_headers('+1 year');

	require_once('includes/auth.inc');
	require_once('includes/game-inserts.inc');
	require_once('includes/messaging.inc');
	require_once('includes/tg-api.inc');


	// refresh any existing user session / keep it alive.
	get_authenticated_user();


	tg_api_start(
		// namespace
		'TPDC.API',

		// methods
		array(
			'echo' => 'tpdc_api_echo',
			'echoJSON' => 'tpdc_api_echo_json',
			// 'startGame' => 'tpdc_game_start_game',
			'reportScore' => 'tpdc_game_report_score',
		),

		// pollable methods
		array(),

		// debug mode?
		false

	); // tg_api_start()



	function tpdc_api_echo($o) {
		return $o;
	}  // tpdc_api_echo();


	function tpdc_api_echo_json($o) {
		return json_encode($o);
	} // tpdc_api_echo_json()


/*
	function tpdc_game_start_game($game_id) {
		$user = authenticated_user();
		if (!$user) {
			return array('tg-api-eval' => "TPDC.Notify(\"Hark!\", \"You must sign in to do that!\");");
		}

		if (sizeof($is_stalking) > 0) {
			return array('rv' => true);
		} else {
			return array('rv' => false);
		}
	} // tpdc_api_set_stalking()
*/


	function tpdc_game_report_score($to, $body) {
		$user = authenticated_user();
		if (!$user) {
			return array('error' => 'Not authenticated.');
		}

		// ???!!! ahhh

	} // tpdc_api_report_score()


	function tpdc_game_get_scores($game_id) {
	} // tpdc_game_get_scores()


?>
