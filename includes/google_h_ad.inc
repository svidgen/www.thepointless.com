<?php
	// omit displaying ads for the time being ... 
	return 1;
?>
<div class='google_bar'><?php

	if (preg_match("/(192.168.*)|(127.0.0.1)|(10\..*)/", $_SERVER['REMOTE_ADDR'])) {
		// print "<div style='width: 468px; height: 60px; border: 1px solid silver; background-color: white;'>Google Ads go here.</div>\n";
		print "<div style='width: 468px; height: 60px; border: 1px solid #aaaaaa; color: #aaaaaa;'>Google ads go here.</div>";
	} else {
?>

<script type="text/javascript"><!--
google_ad_client = "pub-6115341109827821";
/* thepointless.com med banner */
google_ad_slot = "5452243718";
google_ad_width = 468;
google_ad_height = 60;
//-->
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>

<?php
	}

?></div>
