<?php

	require_once('includes/game-inserts.inc');

	$meta_title = "pointless meme'd";

	$memes = array(
		'toilet-paper-not-a-turtle',
		'cleaning-with-kittens'
	);

	$name = $memes[0];
	if (isset($_GET['name'])) {
		if (in_array($_GET['name'], $memes)) {
			$name = $_GET['name'];
		}
	}

	$image = $base_url . "/d-image?fb=lg&url=" . urlencode(
		$base_url . '/images/features/' . $name . '.png'
	);

	$extra_meta_tags = join("\n", array(
		og_tag('og:url', $base_url . $_SERVER['REQUEST_URI']),
		og_tag('og:title', $meta_title),
		og_tag('og:description', isset($body) ? $body : ''),
		og_tag('og:image', $image),
		og_tag('og:type', 'article')
	));

	print "<tpdc:meme data-name=\"{$name}\" title='not a meme'></tpdc:meme>";

?>


