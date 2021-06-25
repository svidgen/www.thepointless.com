<?php
	$meta_title = "the green dot";
?>

<script language="JavaScript">

var clicks = 0;

function dotClick() {
	clicks++;
	document.mainForm.clicks.value = clicks;
} // dotClick()

</script>


	<p align="center">
		<img src="images/greendot.jpg" onClick="dotClick();" />
	</p>

	<div id="message" style="text-align: center; margin: 5px; font-size: big;">
		This is my green dot. It doesn't do anything when you click on it.
	</div>

	<form style="text-align: center;" name="mainForm" method="post" action="dotresults">
		<input type="hidden" name="clicks" value="0" />
		<input type="hidden" name="dot" value="green" />
		<input type="submit" value="I'm done harassing the dot." />
	</form>

	<div style='display: none; margin-top: 40px; text-align: center;'>
		Wait! <a href='/dots'>This isn't the dot I want to harass!</a>
	</div>
