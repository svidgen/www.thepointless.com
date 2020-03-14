<?php

$meta_title = 'the clickometer';

if (isset($_GET['level']) && isset($_SESSION['clickometer_level'])) {
	if ($_GET['level'] == $_SESSION['clickometer_level']) {
		$lval = (int)$_SESSION['clickometer_level'];
		$meta_title = "the s00p3r cLiCkOmEtEr - thepointless.com";
		$html_title = "the s00p3r cLiCkOmEtEr";
	} else {
		$lval = 1;
	}

	unset($_SESSION['clickometer_level']);
} else {
	$lval = 1;
}

if ($lval == 1) {
	$breakable = 1;
} else {
	$breakable = 0;
}

?>
<div>
	Our Clickometer is the most sophisticated click-analysis tool on the net.
	<ol>
		<li>Click or Tap the <b>Clickometer</b> as many times as you can in <span style='color: #993333; font-weight: bold; text-decoration: underline; font-style: italic;'>five seconds</span>.</li>
		<li>Brace yourself.</li>
		<li>And <b>Get Your Results</b>.</li>
	</ol>
</div>

<!-- <p id='timer' style='font-size: large; font-weight: bold;'>Whenever you're ready ...</p> -->

<style type='text/css'>
	#clickocontainer {
		margin: 1.5rem;
		padding: 1.5rem;
		border: 2px solid #aaddff;
		background-color: #f5faff;
	}
	
	#meter {
		position: relative;
		width: 90%;
		height: 4rem;
		border: 2px black solid;
		margin: 1.25rem auto;
		padding: 0px;
		background-color: #fcfcfc;
	}

	#meter_bar {
		position: absolute;
		width: 0%;
		height: 100%;
		background-color: red;
		z-index: 1;
	}

	#timer {
		position: absolute;
		width: 100%;
		margin: 0.75rem auto;
		padding: 0px;
		font-size: 3rem;
		font-weight: bold;
		text-align: center;
		color: #000000;
		z-index: 2;
	}

	.click-overlay {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: transparent;
		z-index: 3;
	}
</style>

<div id='clickocontainer'>

	<div id='meter'>
		<div id='timer'><span style='font-size: 1.25rem; color: #883333;'>Click <u><i>here</i></u>!</span></div>
		<div id='meter_bar'>
		</div>
		<div id='click-target' class='click-overlay' onclick="pump(1);" ondblclick="pump(2);"></div>
	</div>

	<form style='text-align: center;' id='clickometer_form' name='clickometer' action='/clickometer_r' method='POST'>
		<input type='hidden' name='s' value='0' />
		<input type='hidden' name='l' value='<?php print $lval; ?>' />
		<input type='hidden' name='b' value='<?php print $breakable; ?>' />
		<input type='hidden' name='submit_token' value='<?php print add_token('clickometer'); ?>' />
		<input id='submit_button' type='submit' class='toggleable_button' value='Get Your Results' disabled='disabled' />
	</form>
</div>

<div id='click_tracker'></div>

<script type='text/javascript'>
	var ak = '<?php print add_token(
		array(
			'action' => 'award',
			'name' => 'Broken Clickometer',
			'quantity' => 1
		)
	); ?>';
</script>
<script type='text/javascript' src='/js/clickometer.js?<?php print $general_version; ?>'></script>

