<?php
	$meta_title = "dinosaurs have been increasingly hostile lately";

	$share_text = "We don't have to put up with this nonsense from nostril-less, no-fingered, pokey-backed, gill-ridden reptile-birds!";

	require_once('includes/game-inserts.inc');	
	$extra_meta_tags = join("\n", array(
		og_tag('og:url', $base_url . 'big-dinosaur-problem-lately'),
		og_tag('og:title', $meta_title),
		og_tag('og:description', $share_text),
		og_tag('og:image', $base_url . 'images/dinosaur.png'),
		og_tag('og:type', 'article')
	));
?>

<p>Dinosaurs are getting out of control, my internet best friends. They're getting increasingly more vocal and violent in traffic. They're becoming STEGOSAUROUSLY more impatient with fast food professionals. And they've been totally REPTILLIAN and/or BIRDLIKE in how they steal stuff from our bird feeders.</p>

<p style='text-align: center;'>
	<img
		src='/images/dinosaur.png'
		title='dinosaurus rex.'
		alt='dinosaurus rex'
		style='max-width: 80%;'
	/>
</p>

<p>We don't have to put up with this nonsense from nostril-less, no-fingered, pokey-backed, gill-ridden reptile-birds! Stand with Humans and fight back! Contact your congress person and legislate these guys into extinction!</p>

<tpdc:share
	url='/big-dinosaur-problem-lately'
	text="We don't have to put up with this nonsense from nostril-less, no-fingered, pokey-backed, gill-ridden reptile-birds!"
	image="/images/dinosaur.png"
></tpdc:share>
