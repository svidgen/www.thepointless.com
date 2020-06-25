<?php

$is_local_ip = preg_match("/(192.168.*)|(127.0.0.1)|(10\..*)/", $_SERVER['REMOTE_ADDR']);
$is_load_balancer = isset($_SERVER['X-Forwarded-For']);

if ($is_local_ip && !$is_load_balancer) {
	// print "<div style='width: 468px; height: 60px; border: 1px solid silver; background-color: white;'>Google Ads go here.</div>\n";
	print "<!-- Google analytics would go here. -->";
	print "<!-- {$_SERVER['REMOTE_ADDR']} -->";
	print "<!-- " . print_r(getallheaders(), 1) ." -->";
} else if ($google_analytics_id) {

	// require_once('includes/auth.inc');
	// $ga_user = authenticated_user();
	// if ($ga_user) {
	// 	$ga_username = json_encode($ga_user['username']);
	// 	$ga_display_name = json_encode($ga_user['name']);
	// } else {
	// 	$ga_username = '""';
	// 	$ga_display_name = '""';
	// }

?>

<!--Start Google Analytics -->
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', '<?php print $google_analytics_id; ?>']);
  _gaq.push(['_setCustomVar', 1, 'Username', <?php print $ga_username; ?>, 3]);
  _gaq.push(['_setCustomVar', 2, 'Display Name', <?php print $ga_display_name; ?>, 3]);
  _gaq.push(['_setSiteSpeedSampleRate',10]);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
<!--End Google Analytics-->

<?php

}

?>
