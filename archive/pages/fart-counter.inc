<?php

	$meta_title = "fart counter";

?>
<div style='text-align: center;'>
	<img src='/images/240px-Fart.svg.png' style='width: 240px; height: 240px;' />
</div>
<tpdc:fartcounter style='display: block; text-align: center;'>
	<div style="
		text-align: center;
		font-size: 30pt;
	"><span data-id='fartCount'>0</span> farts logged.</div>
	<div style="
		text-align: center;
		font-size: 20pt;
	">You have logged <span data-id='userCount'>0</span> of them.</div>
	<div style='margin-top: 20pt;'>
		<div data-id='trackButton' style="
			position: relative;
			display: inline-block;
			color: #669944;
			border: 2px solid #88aa66;
			background-color: #fafff5;
			font-size: 24pt;
			padding: 5pt 10pt;
			font-weight: bold;
			cursor: pointer;
		">I Farted</div>
	</div>
</tpdc:fartcounter>
