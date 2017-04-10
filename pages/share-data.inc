<?php

	$require_theme = 'default';

	$title = isset($_GET['t']) ? $_GET['t'] : 'thepointless.com';
	$body = isset($_GET['b']) ? $_GET['b'] : "The leader in research, innovation, and education for real life and the world and stuff.";

	$image = isset($_GET['i']) ? $_GET['i'] : 'images/big_giant.png';
	if (!preg_match("/^https?:\/\//", $image)) {
		$image = $base_url . $image;
	}
	// $image = $base_url . '/d-image?fb=1&url=' . urlencode($image);

	// cleanse Image URL here (to prevent XSS)

	$url = isset($_GET['u']) ? $_GET['u'] : (
		isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : $base_url
	);

	// cleanse URL here (to prevent XSS)


	//
	// validate a hash here!?
	//

	require_once('includes/game-inserts.inc');

	$meta_title = $title;
	$meta_description = $body;

	$extra_meta_tags = join("\n", array(
		og_tag('og:url', $base_url . $_SERVER['REQUEST_URI']),
		og_tag('og:title', $title),
		og_tag('og:description', $body),
		og_tag('og:image', $image),
		og_tag('og:see_also', $url),
		og_tag('og:type', 'article')
	));

?>

<h3><?php print htmlsafe($title); ?></h3>
<?php if ($image) { print "<img src='{$image}' />\n"; } ?>
<div><?php print htmlsafe($body); ?></div>
<div><a href="<?php print htmlsafe($url); ?>">See for yourself.</a></div>

<script type='text/javascript'>
	document.location = <?php print json_encode($url); ?>;
</script>
