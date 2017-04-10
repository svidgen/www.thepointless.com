<?php

	require_once('includes/game.inc');
	require_once('includes/game-inserts.inc');


	//
	// first off .. validate the form submission
	//
	if (!isset($_POST['submit_token'])) {
		redirect('/clickometer');
	}

	if (get_token($_POST['submit_token']) != "clickometer") {
		redirect('/clickometer');
	}



	if (isset($_GET['admincheck_score'])) {
		$level = rounded_and_limited(isset($_GET['admincheck_level']) ? $_GET['admincheck_level'] : 1, 1, 2);
		$score = rounded_and_limited($_GET['admincheck_score'], 0, 100);
		$admincheck = true;
	} elseif (isset($_POST['s'])) {
		$level = rounded_and_limited(isset($_POST['l']) ? $_POST['l'] : 1, 1, 2);
		$score = rounded_and_limited($_POST['s'], 0, 100);
		$admincheck = false;
	} else {
		header("Location: {$base_url}clickometer");
		return 1;
	}

	$broken_clickometer = false;

	// do we want to do it this way???
	$display_score = $score * $level;

	if ($level == 2) {
		$clickometer = 's00p3r cLiCkOmEtEr';
		$mouse_image = '75px_super_mouse.png';
	} else {
		$clickometer = 'clickometer';
		$mouse_image = '75px_crude_mouse.png';
	}

	$meta_title = "{$display_score} click power - {$clickometer} results";
	$html_title = "the {$clickometer}";
	$enable_facebook = true;


	$red = round( ($score/100) * 255);
	$green = round( ((100 - $score)/100) * 255);
	$blue = 0;

	$colorCode = "rgb({$red},{$green},{$blue})";

	if ($level == 1) {
		if ($score < 35) {
			$explanation = "Your click power is a clear indication that you spend too much time online. Though this is not due to an internet addiction or any other geekly tendencies. You just spend considerable time looking for the mouse buttons -- a problem for most elderly people, and nothing to be ashamed of.";
		} elseif ($score < 50) {
			$explanation = "You're definitely on the lower end of the click power spectrum. You can probably out-click most girl scouts, even if you can't sell as many cookies. And it's clear that you're not a geek or internet addict, unless you're just a really slow one ... ";
		} elseif ($score < 65) {
			$explanation = "Being on the lower end of normal click power isn't bad, I guess. Chances are you're a pretty normal person. You're familiar with the internet, but not to the extent that you're a threat to 1337 h4x0rz. Which is good, because you wouldn't know what to do if you were h4x3d.";
		} elseif ($score < 80) {
			$explanation = "You're on the upper end of normal click power. You spend a little too much time online, and you're beginning to lose touch with reality. So, you should occassionally spend some time away from anything you can click on, such as dots, worlds of warcraft, and clickometers.";
		} elseif ($score < 90) {
			$explanation = "You're a geek. Fueling yourself with red bull for 36 to 72 hours of coding after 3 hours of sleep results in the bodily oscillation necessary for this kind of click power. Though, coupled with your social anxiety and endless hours of near-motionless MMORPGing, you're overdue for a heart attack or an aneurysm. Find something without mouse buttons to interact with for a few days.";
		} else {
			// $explanation = "Well, you either cheated or you've wired your PC to your nervous system. You're pretty much just a cheater in any case.";
			$explanation = "Seriously, you broke it. You broke the clickometer. It's clear the only way to to get an accurate read on your click power is with the s00p3r cLiCkOmEtEr.";
			$broken_clickometer = true;
			$_SESSION['clickometer_level'] = 2;
			$mouse_image = '75px_cracked_mouse.png';
		}
	} else {
		if ($score < 35) {
			$explanation = "Well that's disappointing. After breaking the normal clickometer, you've barely registered on the s00p3r cLiCkOmEtEr. Your under-performance is overwhelming.";
		} elseif ($score < 50) {
			$explanation = "Not bad. But certainly not great. Have another red bull and try again.";
		} elseif ($score < 65) {
			$explanation = "The red bull is strong with this one ... Your performance here justifies your feat of strength on the standard clickometer. Though, you have much to learn before achieving the rank of Master.";
		} elseif ($score < 80) {
			$explanation = "Alright, that's a little 1337. Cl34rly you.ve got a enough r3d bu11 in you 4 some pr1tt33 intense cl_1c|<1n6.";
		} elseif ($score < 90) {
			$explanation = "0m3y3g0sh j00r f4c3 1z t3h s00p3r 1337z0rz!1//!?";
		} else {
			$explanation = "01110011 00110000 00110000 01110000 00110011 01110010 00100000 00110001 00110011 00110011 00110111 00100000 01101000 00110100 01111000 00100001";
		}

		$sooper_mice = array(
			'lightning' => '75px_lightning_mouse.png',
			'lined' => '75px_lined_mouse.png',
			'super' => '75px_super_mouse.png'
		);
		$mouse_image_index = array_rand($sooper_mice);
		$mouse_image = $sooper_mice[$mouse_image_index];
	}


	// display_score isn't markup'd. it's just the score
	// adjusted for level.
	if (get_user_id()) {
		// $rows = select_user_things(array('name' => 'Click Power'));
		// if (is_array($rows) && sizeof($rows) > 0) {
		// } else {
		// }
		award_and_notify("Click Power", $display_score, $display_score);
	}


	if ($broken_clickometer) {
		$score_line = "You <span>broke</span> the clickometer!";
		$social_score_line = "You BROKE the clickometer!";
		$try_again_link = "<a href='/clickometer?level=2'>Try the s00p3r cLiCkOmEtEr</a>";
		$meta_title = "You BROKE it - {$clickometer} results";
		award_and_notify("Broken Clickometer", 1);
	} else {
		$score_line = "You have <span>{$display_score}</span> click power!";
		$social_score_line = "{$display_score} click power!";
		$try_again_link = "<a href='/clickometer'>Try again</a>";
	}


	print "
		<style type='text/css'>
			#score {
				color: {$colorCode};
				font-size: large;
				font-weight: bold;
				text-align: left;
				margin: 40px 20px 0px;
			}

			#score span {
				font-size: 200%;
			}

			#score img {
				text-align: left;
				vertical-align: bottom;
				width: 75px;
				height: 103px;
			}

			#explanation {
				margin: 10px 20px;

			}

		</style>
	
		<div id='score'>
			<img src='/images/{$mouse_image}' alt='mouse' title='clickometer awesomeness' />
			{$score_line}
		</div>

		<div id='explanation'>
		{$explanation}
		</div>		
		
	<div id='action_links' style='text-align: center;'>
		{$try_again_link}
	</div>

	";


	function rounded_and_limited($v, $lowval, $highval) {
		$v = round($v);
		$v = max($v, $lowval);
		$v = min($v, $highval);
		return $v;
	} // rounded_and_limited()

?>


<script type='text/javascript'>
	var action_links = document.getElementById('action_links');
	var current_action_html = action_links.innerHTML;
	action_links.innerHTML = "<a href='javascript:fb_publish();' class='facebook'><span>Inform the Masses</span></a> and " + current_action_html;

	function fb_publish() {
		TPDC.FacebookPublish({
			name: <?php print json_encode($social_score_line); ?>,
			description: <?php print json_encode($explanation); ?>,
			image: '<?php print $base_url; ?>images/<?php @print $mouse_image; ?>'
		});
	} // fb_publish()
</script>
