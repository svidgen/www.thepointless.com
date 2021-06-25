<?php

$sayings = select_random_proverbs('small-potato', 1);
$saying = $sayings[0];
$wise_text = htmlsafe($saying['proverb_text']);
$wise_id = $saying['proverb_id'];


//
// like the good marketing professionals we are, let's experiement
// with a few different formats here to see what performs the best! 
//

$wi = rand(1, 5);
if ($wi == 1) {
	print "<div class='wiseman_footer'>
		A wise man once said,
		<br />\"{$wise_text}\"<br /><br />
		<a href='/add-potato?fo=1' class='action_link'>Contribute some wisdom.</a></div>";
} elseif ($wi == 2) {
	print "<div class='wiseman_footer'>
		A wise man once said,
		<br />\"{$wise_text}\"<br /><br />
		<a href='/small-potatoes?id={$wise_id}&fo=2' class='action_link'>Share this wisdom.</a>
	</div>";
} elseif ($wi == 3) {
	print "<div class='wiseman_footer'>
		<a href='/small-potatoes?id={$wise_id}&fo=3'>A wise man once said,
		<br />\"{$wise_text}\"</a>
	</div>";
} elseif ($wi == 4) {
	print "<div class='wiseman_footer'>
		A wise man once said,
		<br />\"{$wise_text}\"<br /><br />
		<a href='/small-potatoes?fo=4' class='action_link'>See more quotes.</a>
	</div>";
} else {
	print "<div class='wiseman_footer'>
		A wise man once said,
		<br />\"{$wise_text}\"<br /><br />
		<a href='/small-potatoes?fo=5' class='action_link'>From The Book of Small Potatoes</a>
	</div>";
}

?>
