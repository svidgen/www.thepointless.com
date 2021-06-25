<?php

	$html_title = "bop the girl";


	require_once('includes/game.inc');

	$bop = allow_awards(array(
		award_cap("Salty Tear", 1, 10, false)
	));

?>
<script type='text/javascript'>
var boppedgirl = new Image();
boppedgirl.src = "images/bopthegirl.gif";

function bopthegirl() {
	var thegirl = document.getElementById("thegirl");
	thegirl.src = boppedgirl.src;
	if (Math.random() > 0.90) {
		TPDC.award(1, "Salty Tear");
	}
}
</script>

<center>
<img id="thegirl" src="images/thegirl.jpg" />
<br /><br />
<form style="text-align: center; width: 100%;"><input style="margin-left: auto; margin-right: auto;" type="button" value="Bop the Girl" onclick="bopthegirl();" />
</form>
</center>
