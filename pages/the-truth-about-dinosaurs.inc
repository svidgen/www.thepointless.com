<?php
	$meta_title = "the truth about dinosaurs";

	$share_text = "Far from being the \"terrible lizards\" we see portrayed in the the movies, dinosaurs were actually the asthmatic rejects of the prehistoric world.";

	require_once('includes/game-inserts.inc');	
	$extra_meta_tags = join("\n", array(
		og_tag('og:url', $base_url . 'the-truth-about-dinosaurs'),
		og_tag('og:title', $meta_title),
		og_tag('og:description', $share_text),
		og_tag('og:image', $base_url . 'images/dinosaur.png'),
		og_tag('og:type', 'article')
	));
?>

<p>The popular media would have you believe that dinosaurs were "terrible lizards" that dominated the prehistoric countryside. By our modern standards, these creatures are "cool cats." But, that wasn't the case in prehistoric times.</p>

<p style='text-align: center;'>
	<img
		src='/images/dinosaur.png'
		title='dinosaurus rex.'
		alt='dinosaurus rex'
		style='max-width: 80%;'
	/>
</p>

<p><?php print $share_text; ?> Having gills, no nostrils, and <i>no fingers</i>, these gargantuine, top-heavy, heavy-breathing, clumsy blobs would have been picked last or <i>not at all</i> during gym class. And with those pokey back things, finding cool clothing was simply out of the question.</p>

<p>These lonely creatures were the absolute uncoolest you could be in the prehistoric world.</p>

<tpdc:share
	url='big-dinosaur-problem-lately'
	image="/images/dinosaur.png"
></tpdc:share>
