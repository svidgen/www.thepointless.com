<?php

	$meta_title = "all the stuff";
	require_once('includes/sitemap.inc');
	$links = getLinks(
		getMap('features'),
		"<li><a href=\"{url}\" title=\"{name}\">{name}</a></li>",
		"<p><ul>{links}</ul></p>"
	);

?>

<p>This is all the stuff.</p>
<?php print $links; ?>
<p>Or at least <i>some</i> stuff.</p>
<p>Some stuff is pending.</p>
<p>Other stuff is missing.</p>
