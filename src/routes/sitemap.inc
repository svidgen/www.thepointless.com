<?php

	$meta_title = 'site map';
	$html_title = '';

	require_once('includes/game.inc');
	$awards_auth = allow_awards(array(
		inventory_cap("Self", 1)
	));

?>
<div style='text-align: center;'>
	<img src="<?php print $base_url; ?>images/sitemap.jpg" style='width: 500px; height: 500px; border: 2px solid black;' usemap="#mymap" alt='map' title='site map' />
</div>

<map name="mymap">
	<area shape="rect" coords="350,15,415,65" href="/index">
	<area shape="rect" coords="163,441,208,486" href="javascript:TPDC.award(1, 'Self', 'Congrats', 'You\'ve found yourself.');">
</map>

