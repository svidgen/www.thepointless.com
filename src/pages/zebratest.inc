<?php
	$meta_title = "zebra awareness test";

	$facebook_button = false;

	if (isset($_GET['test']) && $_GET['test'] == 'start') {
		// display the test form
		print "
			<form id='zebratest' name='zebratest' action='/zebratest' method='post' onsubmit='return doSubmit();'>
				<input type='hidden' name='test' value='results' />
			
				<img src='" . zebra_url(128) . "' style='float: right; margin-right: 20px;' />
				Answer the following questions to the best of your ability.
				<ol class='spaced'>
					<li>
						<div><b>Do you walk on all fours?</b></div>
						<input type='radio' name='q1' value='yes' /> Yes
						<input type='radio' name='q1' value='no' /> No
					</li>

					<li>
						<div><b>Do you have black and white stripes?</b></div>
						<input type='radio' name='q2' value='yes' /> Yes
						<input type='radio' name='q2' value='no' /> No
					</li>

					<li>
						<div><b>Do you have hooves?</b></div>
						<input type='radio' name='q3' value='yes' /> Yes
						<input type='radio' name='q3' value='no' /> No
					</li>

					<li>
						<div><b>Do you ever think to yourself, <i>Hey, I might be a zebra</i>?</b></div>
						<input type='radio' name='q4' value='yes' /> Yes
						<input type='radio' name='q4' value='no' /> No
					</li>

					<li>
						<div><b>Are you a zebra?</b></div>
						<input type='radio' name='q5' value='yes' /> Yes
						<input type='radio' name='q5' value='no' /> No
					</li>
				</ol>
				<div style='margin: 10px 35px;'><input type='submit' value='Check Your Results' /></div>
			</form>

			<script type='text/javascript'>
				var thinking = false;

				function doSubmit() {
					if (thinking) {
						return true;
					}
					
					thinking = true;
					
					var think_div = document.createElement('div');
					think_div.innerHTML = \"Calculating ...<br /><br /><img src='/images/please_wait.gif' />\";
					think_div.style.fontSize = '3rem';
					think_div.className = 'modal';
					document.body.appendChild(think_div);

					var submittimeout = setTimeout(function() { document.getElementById('zebratest').submit(); }, 4000);

					return false;
				} // doSubmit()
			
			</script>
		";
	} elseif (isset($_POST['test']) && $_POST['test'] == 'results') {
		// display test results, facebook share link, and a teaser for
		// other thepointless.com page. 

		$meta_title = "zebra awareness test results";

		$facebook_button = true;
		$enable_facebook = true;

		// score the results
		$score = 0;

		// question values 
		$question_values = array(
			'1' => '2',
			'2' => '2',
			'3' => '2',
			'4' => '2',
			'5' => '1'
		);
		
		foreach ($_POST as $k => $v) {
			if (preg_match("/^q([0-9])+$/", $k, $matches)) {
				if ($v == 'yes') {
					$index = (int)$matches[1];
					if (isset($question_values[$index])) {
						$score += $question_values[$index];
					}
				}
			}
		}

		require_once("includes/game-inserts.inc");
		award_and_notify("Zebra Awareness Pin", 1, 3);
		if ($score == 0) {
			$result = "You <u>are</u> a zebra.";
			$plain_result = "You are a zebra.";
			$share_results = "Uh oh. I might be a zebra.";
			$overlay_url = checkmark_url();
			$explanation = "Your responses are unmistakable. Remember, being a zebra is nothing to be ashamed of. However, this does put you at a great disadvantage in a society littered with zebra discrimination. Remember to seek the support of your family and friends. More importantly, spread zebra awareness!";
			award_and_notify("Postive Test Result", 1, 3);
		} elseif ($score == 1) {
			$result = "You <u>might</u> be a zebra.";
			$plain_result = "You might be a zebra.";
			$share_results = "Uh oh. I might be a zebra.";
			$overlay_url = question_mark_url();
			$explanation = "The results are inconclusive! It would be best if you could <a href='/zebratest?test=start'>retake the test</a> to ensure you answered all of the questions correctly. We can't have zebras walking around thinking they're people ...";
			award_and_notify("Inconclusive Test Result", 1, 3);
		} else {
			$result = "You are <u>not</u> a zebra.";
			$plain_result = "You are not a zebra.";
			$share_results = "Woot! I am not a zebra. (No offense to zebras!!!)";
			$overlay_url = red_x_url();
			$explanation = "This is great news! Free from the burdens and discriminations of zebrahood, you will find it easy to adhere to human activities such as shaking hands and driving cars. You can breath easy. But, spread the awareness: anyone you know could unwittingly be a zebra.";
			award_and_notify("Negative Test Result", 1, 3);
		}
		
		print "
		<div class='img_overlay' style='width: 256px; margin: 20px auto;'>
			<img src='" . zebra_url() . "' class='base' />
			<img src='{$overlay_url}' class='overlay' />
		</div>
		<h3 style='color: purple; text-align: center;'>{$result}</h3>
		<div class='padded'>
			{$explanation}
		</div>

		<div class='padded' style='text-align: right; display: none;'>
			Not sure you answered everything correctly?
			<br /><a href='/zebratest?test=start'>Try again.</a>
		</div>


		";

	} else {
		print "
<a href='http://angrystickman.blogspot.com/2010/12/zebra-awareness.html' target='_blank'>Zebra awareness</a> is <i>extremely</i> important. Our zebra awareness test is designed by <u><i>professional</i></u> <b>Digital Zebra Recognition Specialists</b> to help you determine whether you are a zebra.
<div style='text-align: center; margin: 30px auto;'>
	<a class='nohoverdecoration' href='zebratest?test=start' style='font-size: x-large; font-weight: bold;'>
		<img src='" . zebra_url() . "' alt='zebra' style='border: 0px;' />
		<br />Start the Test
	</a>
</div>";
	}

	
	function zebra_url($px = 256) {
		return "/images/zebratest/zebra.png";
	} // zebra_url()
	
	function red_x_url($px = 256) {
		return "/images/zebratest/red_x.png";
	} // red_x_url()A

	function checkmark_url($px = 256) {
		return "/images/zebratest/green_check.png";
	} // checkmark_url()

	function question_mark_url($px = 256) {
		return "/images/zebratest/question_mark.png";
	} // checkmark_url()


?>

<div id='action_links' style='text-align: center; margin: 20px;'><a href='/zebratest?test=start'>Retake the test</a></div>

<tpdc:share
	text="<?php print $share_results; ?> Please help spread zebra awareness!"
	image="/images/zebratest/zebra.png"
></tpdc:share>